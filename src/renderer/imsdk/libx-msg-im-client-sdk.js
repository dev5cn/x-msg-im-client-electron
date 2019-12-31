const path = require('path');
const ffi = require('ffi');
const ref = require('ref');
const net = require('net');
const xmsgim = require('./pb/x-msg-im-client');

/* https://github.com/node-ffi/node-ffi */
const sdkffi = ffi.Library(path.resolve(__dirname, 'libx-msg-im-client-ffi'), {
    x_msg_im_client_sdk_init: ['void', []], // 初始化sdk
    x_msg_im_client_sdk_startup_local_tcp_client: ['int', ['int']], // c++向js层发起tcp连接，即c++链接服务器，服务器连接tcp
    x_msg_im_client_sdk_exit: ['void', []],
    //
    x_msg_im_client_sdk_net_new_api: ['int', ['char*']],
    x_msg_im_client_sdk_net_del_api: ['void', ['int']],
    x_msg_im_client_sdk_net_future: ['int', ['int', 'char*', 'char*', 'int']],
    x_msg_im_client_sdk_net_end_trans: ['int', ['uint', 'int', 'char*', 'char*', 'char*', 'int']],
    x_msg_im_client_sdk_net_stop_try: ['void', ['int']],
    //
    x_msg_im_client_sdk_db_init: ['int', ['char*']],
    x_msg_im_client_sdk_db_new_api: ['int', ['char*']],
    x_msg_im_client_sdk_db_del_api: ['void', ['int']],
    x_msg_im_client_sdk_db_future_global: ['int', ['char*']],
    x_msg_im_client_sdk_db_future_usr_org: ['int', ['int', 'char*']],
    x_msg_im_client_sdk_db_future_usr_dat: ['int', ['int', 'char*']],
    x_msg_im_client_sdk_db_future_global_prepare: ['int', ['char*', 'int']],
    x_msg_im_client_sdk_db_future_usr_org_prepare: ['int', ['int', 'char*', 'int']],
    x_msg_im_client_sdk_db_future_usr_dat_prepare: ['int', ['int', 'char*', 'int']],
    //
    x_msg_im_client_sdk_misc_log_set_output: ['void', ['char*']],
    x_msg_im_client_sdk_misc_log_set_level: ['void', ['char*']],
    x_msg_im_client_sdk_misc_log_sub: ['void', []],
    x_msg_im_client_sdk_misc_sha256_to_lowercase: ['char*', ['char*']],
    x_msg_im_client_sdk_misc_aes128_enc_to_hex_lowercase: ['char*', ['char*', 'char*']],
    x_msg_im_client_sdk_misc_aes128_dec_from_hex_lowercase: ['char*', ['char*', 'char*']],
});

// export PROTOBUF=/d/software/tools/protobuf
/** -------------------------------------------------------------------------------------------------------------------------------- */
/**                                                                                                                                  */
/** 全局变量                                                                                                                         */
/**                                                                                                                                  */
/** -------------------------------------------------------------------------------------------------------------------------------- */
let cxxLogCb; /* c++ driver层日志回调. */
let recvBuf; /* 本地tcp server上的接收缓冲区, 处理报文分片. */
let netApids = new Map(); /* net-api实例管理, 相当于: hashmap<netApiId, object: { subEvnCallBack, subReqCallBack, transMap<tid, initTrans> }>. */
let dbApiIds = new Map(); /* net-api实例管理, 相当于: hashmap<dbApiId, object: { transMap<tid, dbTrans> }>. */
//
let DB_FILED_TYPE_BIGINT = 0x00; /* int or bigint. */
let DB_FILED_TYPE_TEXT = 0x01; /* text. */
let DB_FILED_TYPE_BLOB = 0x02; /* blob. */

let MSG_SYNC_NUM = 0;
let MSG_SYNC__TOTAL_NUM = 0;
/** -------------------------------------------------------------------------------------------------------------------------------- */
/**                                                                                                                                  */
/** 初始化                                                                                                                          */
/**                                                                                                                                  */
/** -------------------------------------------------------------------------------------------------------------------------------- */
/* 初始化x-msg-im-client-ffi. */
function startupXmsgImClientFfi(cb /* 初始化完成后回调. */, port /* 本地tcp server监听端口. */) {
    let server = net.createServer();
    port = arguments[1] ? port : 18629;
    server.listen(port, '127.0.0.1');
    server.on('listening', function () {
        /* listen成功. */
        console.log(
            'local server listening success, address: ' + server.address().address + ':' + server.address().port
        );
        if (sdkffi.x_msg_im_client_sdk_startup_local_tcp_client(port) < 1) {
			/* 尝试从c++向js层发起tcp连接. */ console.error(
            'it`s a bug, c++ driver layer can not connect to local tcp server, address: ' +
            server.address().address +
            ':' +
            server.address().port
        );
            return;
        }
        cb(); /* 初始化成功, 从这里开始. */
    });
    server.on('error', function (err) {
        /* listen失败. */
        console.info('can not listen on assign port: ' + port + ', we will try an other one, err: ' + err);
        startupXmsgImClientFfi(cb, Number(port) + 7 /* 换一个端口. */);
    });
    server.on('connection', function (sock) {
        /* 获得一个从c++上来的tcp链接. */
        console.info('got a connection from host: ' + sock.remoteAddress + ':' + sock.remotePort);
        sock.on('data', function (dat) {
            /* 从c++层获得数据. */

            decodeCppDriverMsg(dat);
        });
        sock.on('close', function (data) {
            /* 与c++之间的tcp断开. */
            console.error(
                'it`s a bug, local c++ driver layer connection lost: ' + sock.remoteAddress + ':' + sock.remotePort
            );
        });
    });
}

/* 解析c++层上来的消息. */
function decodeCppDriverMsg(dat) {
    recvBuf = recvBuf == null ? dat : Buffer.concat([recvBuf, dat]);
    if (recvBuf.length <= 4) return;
    let size = recvBuf.length;
    let take = 0;
    let remain = size;

    while (true) {
        //
        let len = recvBuf.slice(take, take + 4).readInt32BE();
        if (remain - 4 < len) {
            //
            if (take == 0) return;
            recvBuf = recvBuf.slice(take, recvBuf.length);
            return;
        }
        //
        let event = xmsgim.XmsgImSdkEventAdapter.decode(recvBuf.slice(take + 4, take + len + 4));

        switch (
        event.evnType //
        ) {
            case xmsgim.XmsgImSdkEventType.X_MSG_IM_SDK_EVENT_TYPE_NET_NOTICE:
                cppDriverMsg4netNotice(event.apiId, event.netNotice);
                break;
            case xmsgim.XmsgImSdkEventType.X_MSG_IM_SDK_EVENT_TYPE_NET_REQ:
                cppDriverMsg4netReq(event.apiId, event.netReq);
                break;
            case xmsgim.XmsgImSdkEventType.X_MSG_IM_SDK_EVENT_TYPE_NET_RSP:
                cppDriverMsg4netRsp(event.apiId, event.netRsp);
                break;
            case xmsgim.XmsgImSdkEventType.X_MSG_IM_SDK_EVENT_TYPE_DB_RSP:
                cppDriverMsg4dbRsp(event.apiId, event.dbRsp);
                break;
            case xmsgim.XmsgImSdkEventType.X_MSG_IM_SDK_EVENT_TYPE_CXX_LOG:
                cppDriverMsg4cxxLog(event.cxxLog);
                break;
            default:
                console.error('it`s a bug, unexpected event type: ' + event.evnType);
                break;
        }
        //
        take += len + 4;
        remain -= len + 4;
        if (remain == 0) {
            //
            recvBuf = null;
            return;
        }
        if (remain <= 4) {
            //
            recvBuf = recvBuf.slice(take, recvBuf.length);
            return;
        }
    }
}

/* 从net-api上来的响应. */
function cppDriverMsg4netRsp(netApiId, netRsp) {
    let netApi = netApids.get(netApiId);
    if (netApi == null) {
        //
        console.error('it`s a bug, can not found net-api for id: ' + netApiId);
        return;
    }
    let cb = netApi.initTrans.get(netRsp.tid);
    netApi.initTrans.delete(netRsp.tid);
    let rsp = null;

    if (netRsp.dat != null && netRsp.dat.length > 0) {
        rsp = xmsgim[netRsp.msg].decode(netRsp.dat);
    }

    cb(netRsp.ret, netRsp.desc, rsp);
}

/* 从net-api上来的通知. */
function cppDriverMsg4netNotice(netApiId, netNotice) {
    let netApi = netApids.get(netApiId);

    if (netApi == null) {
        //
        console.error('it`s a bug, can not found net-api for id: ' + netApiId);
        return;
    }

    netApi.subEvn(xmsgim[netNotice.msg].decode(netNotice.dat));
}

/* 从net-api上来的请求. */
function cppDriverMsg4netReq(netApiId, netReq) {
    let netApi = netApids.get(netApiId);

    if (netApi == null) {
        //
        console.error('it`s a bug, can not found net-api for id: ' + netApiId);
        return;
    }
    let trans = new Object();
    trans.netApiId = netApiId;
    trans.tid = netReq.tid;
    trans.msg = netReq.msg;

    trans.req = xmsgim[netReq.msg].decode(netReq.dat);
    netApi.subReq(trans, trans.req);
}

/* 从db-api上来的响应. */
function cppDriverMsg4dbRsp(dbApiId, dbRsp) {
    let dbApi = dbApiIds.get(dbApiId);
    if (dbApi == null) {
        //
        console.error('it`s a bug, can not found db-api for id: ' + dbApiId);
        return;
    }
    let cb = dbApi.trans.get(dbRsp.tid);
    dbApi.trans.delete(dbRsp.tid);
    cb(dbRsp.ret, dbRsp.desc, dbRsp.dat);
}

/* c++ driver layer上来的日志. */
function cppDriverMsg4cxxLog(cxxLog) {
    cxxLogCb(cxxLog);
}
/** -------------------------------------------------------------------------------------------------------------------------------- */
/**                                                                                                                                  */
/**                                                                                                                                  */
/**                                                                                                                                  */
/** -------------------------------------------------------------------------------------------------------------------------------- */
/* 初始化c++ driver. */
function xmsgImClientSdkInit() {
    sdkffi.x_msg_im_client_sdk_init();
}

/* 当前api实例上的通知事件, 一些来自本地, 另一些来自网络. */
function netApiSubEvn(netApiId, cb) {
    let netApi = netApids.get(netApiId);
    if (netApi == null) {
        //
        netApi = new Object();
        netApi.netApiId = netApiId;
        netApi.subEvn = cb;
        netApi.subReq = null;
        netApi.initTrans = new Map();
        netApids.set(netApiId, netApi);

        return;
    }
    netApi.subEvn = cb;
}

/* net-api上的网络主动请求(需要本地回送响应). */
function netApiSubReq(netApiId, cb) {
    let netApi = netApids.get(netApiId);
    if (netApi == null) {
        //
        netApi = new Object();
        netApi.netApiId = netApiId;
        netApi.subEvn = null;
        netApi.subReq = cb;
        netApi.initTrans = new Map();
        netApids.set(netApiId, netApi);
        return;
    }
    netApi.subReq = cb;
}

/** -------------------------------------------------------------------------------------------------------------------------------- */
/**                                                                                                                                  */
/**                                                                                                                                  */
/**                                                                                                                                  */
/** -------------------------------------------------------------------------------------------------------------------------------- */
/* 创建一个网络层api实例. */
function newNetApi(host /* 接入地址. */) {
    return sdkffi.x_msg_im_client_sdk_net_new_api(str2buffer(host));
}

/* host to network主动型事务. */
function netFuture(netApiId /* 网络api实例. */, req /* 请求的pb对象. */, cb /* 响应或超时的callback. */) {
    let netApi = netApids.get(netApiId);

    if (netApi == null) {
        //
        console.error('it`s a bug, can not found net-api for id: ' + netApiId);

        return;
    }
    let dat = xmsgim[req.constructor.name].encode(req).finish();
    let tid = sdkffi.x_msg_im_client_sdk_net_future(
        netApiId,
        str2buffer(req.constructor.name),
        dat,
        dat.length
    ); /* 发起登录. */

    netApi.initTrans.set(tid, cb);
}

/* 在指定的目录下创建并打开全局数据库. */
function openDbGlobal(path) {
    let ret = sdkffi.x_msg_im_client_sdk_db_init(str2buffer(path));

    if (ret != 0) return;
    let dbApi = new Object();
    dbApi.dbApiId = 0x00;
    dbApi.trans = new Map();
    dbApiIds.set(dbApi.dbApiId, dbApi);
    return ret;
}

/* 数据库事务, 简单型, 无参数绑定(db-global). */
function dbFutureGlobal(sql /* 请求的sql. */, cb /* 响应或超时的callback. */) {
    let dbApi = dbApiIds.get(0x00);
    if (dbApi == null) {
        //
        console.error('it`s a bug, can not found db-api for id: ' + 0x00);
        return;
    }
    let tid = sdkffi.x_msg_im_client_sdk_db_future_global(str2buffer(sql)); /* 查询. */
    dbApi.trans.set(tid, cb);
}

/* 数据库事务, 涉及参数预处理(db-global). */
function dbFutureGlobalPrepare(sql /* 请求的sql. */, row, cb /* 响应或超时的callback. */) {
    let dbApi = dbApiIds.get(0x00);
    if (dbApi == null) {
        //
        console.error('it`s a bug, can not found db-api for id: ' + 0x00);
        return;
    }
    let dbCrudReq = xmsgim.XmsgImClientDbCrudReq.create({ sql: sql, row: row });
    let dat = xmsgim.XmsgImClientDbCrudReq.encode(dbCrudReq).finish();
    let tid = sdkffi.x_msg_im_client_sdk_db_future_global_prepare(dat, dat.length);
    dbApi.trans.set(tid, cb);
}

/* 创建一个数据库api实例. */
function newDbApi(cgt /* 用户channel global title. */) {
    let dbApiId = sdkffi.x_msg_im_client_sdk_db_new_api(str2buffer(cgt));
    let dbApi = new Object();
    dbApi.dbApiId = dbApiId;
    dbApi.trans = new Map(); /* db-api实例上的事务缓存, 相当于: hashmap<tid, XmsgImClientDbCrudReq>. */
    dbApiIds.set(dbApiId, dbApi);
    return dbApiId;
}

/* 数据库事务, 简单型, 无参数绑定(db-usr-org). */
function dbFutureUsrOrg(dbApiId, sql /* 请求的sql. */, cb /* 响应或超时的callback. */) {
    let dbApi = dbApiIds.get(dbApiId);
 
    if (dbApi == null) {
        //
        console.error('it`s a bug, can not found db-api for id: ' + dbApiId);
        return;
    }
    let tid = sdkffi.x_msg_im_client_sdk_db_future_usr_org(dbApiId, str2buffer(sql)); /* 查询. */

    dbApi.trans.set(tid, cb);
}

/* 数据库事务, 涉及参数预处理(db-usr-org). */
function dbFutureUsrOrgPrepare(dbApiId, sql /* 请求的sql. */, row, cb /* 响应或超时的callback. */) {
    let dbApi = dbApiIds.get(dbApiId);
    if (dbApi == null) {
        //
        console.error('it`s a bug, can not found db-api for id: ' + dbApiId);
        return;
    }
    let dbCrudReq = xmsgim.XmsgImClientDbCrudReq.create({ sql: sql, row: row });
    let dat = xmsgim.XmsgImClientDbCrudReq.encode(dbCrudReq).finish();
    let tid = sdkffi.x_msg_im_client_sdk_db_future_usr_org_prepare(dbApiId, dat, dat.length);
    dbApi.trans.set(tid, cb);
}

/* 数据库事务, 简单型, 无参数绑定(db-usr-dat). */
function dbFutureUsrDat(dbApiId, sql /* 请求的sql. */, cb /* 响应或超时的callback. */) {
    let dbApi = dbApiIds.get(dbApiId);
    if (dbApi == null) {
        //
        console.error('it`s a bug, can not found db-api for id: ' + dbApiId);
        return;
    }
    let tid = sdkffi.x_msg_im_client_sdk_db_future_usr_dat(dbApiId, str2buffer(sql)); /* 查询. */
    dbApi.trans.set(tid, cb);
}

/* 数据库事务, 涉及参数预处理(db-usr-dat). */
function dbFutureUsrDatPrepare(dbApiId, sql /* 请求的sql. */, row, cb /* 响应或超时的callback. */) {
    let dbApi = dbApiIds.get(dbApiId);

    if (dbApi == null) {
        //
        console.error('it`s a bug, can not found db-api for id: ' + dbApiId);
        return;
    }
    let dbCrudReq = xmsgim.XmsgImClientDbCrudReq.create({ sql: sql, row: row });

    let dat = xmsgim.XmsgImClientDbCrudReq.encode(dbCrudReq).finish();

    let tid = sdkffi.x_msg_im_client_sdk_db_future_usr_dat_prepare(dbApiId, dat, dat.length);
    dbApi.trans.set(tid, cb);
}

/* 从数据库结果集中取一个字符串. */
function getStrFromDbRst(rst, row, field) {
    let col = rst.row[row].col[rst.column[field]];
    return col.valText;
}

/* 从数据库结果集中取一个长整型. */
function getLongFromDbRst(rst, row, field) {
    // console.log("getLongFromDbRst============",jsonRsp(rst))
    // rst = jsonRsp(rst)
    let col = rst.row[row].col[rst.column[field]];
    return col.valInt;
}

/* 从数据库结果集中取一个pb对象. */
function getPbFromDbRst(rst, row, field, msg) {
    let col = rst.row[row].col[rst.column[field]];

    return xmsgim[msg].decode(col.valBlob);
}

/** -------------------------------------------------------------------------------------------------------------------------------- */
/**                                                                                                                                  */
/** 一些工具函数                                                                                                                   */
/**                                                                                                                                  */
/** -------------------------------------------------------------------------------------------------------------------------------- */

/* string to buffer, end of zero. */
function str2buffer(str) {
    let bf = Buffer.alloc(str.length + 1);
    for (let i = 0; i < str.length; ++i) bf[i] = str.charCodeAt(i);
    bf[str.length] = 0x00;
    return bf;
}

/* sha256(raw).toHexLowerCase(). */
function sha256toLowerCase(raw) {
    let buf = sdkffi.x_msg_im_client_sdk_misc_sha256_to_lowercase(str2buffer(raw));
    return ref.readCString(buf, 0);
}

/* aes128加密. */
function aes128enc2hexStrLowerCase(key, org) {
    let buf = sdkffi.x_msg_im_client_sdk_misc_aes128_enc_to_hex_lowercase(str2buffer(key), str2buffer(org));
    return ref.readCString(buf, 0);
}

/* aes128解密. */
function aes128decFromHexStrLowerCase(key, org) {
    let buf = sdkffi.x_msg_im_client_sdk_misc_aes128_dec_from_hex_lowercase(str2buffer(key), str2buffer(org));
    return ref.readCString(buf, 0);
}

/* 设置sdk日志级别. */
function setSdkLogLevel(level) {
    sdkffi.x_msg_im_client_sdk_misc_log_set_level(str2buffer(level));
}

/* 订阅c++层日志. */
function subSdkLog(cb) {
    cxxLogCb = cb;
    sdkffi.x_msg_im_client_sdk_misc_log_sub();
}

/* net-api上的被动事务结束. */
function netApiTransEnd(trans) {
    let dat = trans.rsp == null ? null : xmsgim[trans.rsp.constructor.name].encode(trans.rsp).finish();
    sdkffi.x_msg_im_client_sdk_net_end_trans(
        trans.tid,
        trans.ret,
        trans.desc == null ? null : str2buffer(trans.desc), //
        trans.rsp == null ? null : str2buffer(trans.rsp.constructor.name),
        dat == null ? null : dat,
        dat == null ? 0 : dat.length
    );
}

/** -------------------------------------------------------------------------------------------------------------------------------- */
/**                                                                                                                                  */
/** test                                                                                                                             */
/**                                                                                                                                  */
/** -------------------------------------------------------------------------------------------------------------------------------- */

/* test for network api. */
function test4netApi() {
    startupXmsgImClientFfi(() => {
        setSdkLogLevel('RECORD'); /* 设置底层日志级别. */
        // subSdkLog((cxxLog) => console.log("c++ log: " + cxxLog.log)); /* 订阅c++ driver layer的日志. */
        xmsgImClientSdkInit(); /* 初始化c++ driver. */
        //
        let netApiId = newNetApi('47.98.188.94:8080'); /* 通过指定的接入地址构造一个网络层的api实例. */
        //
        netApiSubEvn(netApiId, notice =>
            console.log(
                'event got a net-api event, msg: ' +
                notice.constructor.name +
                ', dat: ' +
                JSON.stringify(notice.toJSON())
            )
        ); /* 订阅网络层api实例上的事件, 包括本地事件与网络通知. */
        //
        netApiSubReq(netApiId, (trans, req) => {
            /* 订阅网络api实例上的网络请求(需要回送响应). */
            console.log(
                'got a net-api network request, msg: ' + req.constructor.name + ', dat: ' + JSON.stringify(req.toJSON())
            );
            trans.ret = 0x00;
            netApiTransEnd(trans);
        });
        //
        let pwdSha256 = sha256toLowerCase('password');
        let usr = 'usr00';
        let salt = 'saltsalt';
        let sign = sha256toLowerCase(usr + salt + pwdSha256);
        let req = xmsgim.XmsgImAuthSimpleReq.create({
            usr: usr,
            salt: salt,
            sign: sign,
            dev: { plat: 'linux', did: '0.0.0.0', ver: '0.0.0' },
        }); /* 鉴权. */
        netFuture(netApiId, req, (ret, desc, rsp) => {
            if (ret != 0) {
                //
                console.error('auth with x-msg-im-auth failed, ret: ' + ret + ', desc: ' + desc);
                return;
            }
            console.log('auth with x-msg-im-auth successful, rsp: ' + JSON.stringify(rsp.toJSON()));
        });
    });
}

/* test for database api. */
function test4dbApi() {
    startupXmsgImClientFfi(() => {
        /* 初始化x-msg-im-client-sdk. */
        setSdkLogLevel('RECORD'); /* 设置底层日志级别. */
        subSdkLog(cxxLog => console.log('c++ log: ' + cxxLog.log)); /* 订阅c++ driver layer的日志. */
        xmsgImClientSdkInit(); /* 初始化c++ driver. */
        //
        if (openDbGlobal('./db') != 0) {
			/* 在./db/目录下创建并打开全局数据库. */ console.error('open global database failed');
            return;
        }
        //
        console.log('open global database successful');
        let sql = 'create table tb_global_login_history (\n';
        sql += '\t usr text primary key not null,\n';
        sql += '\t pwdSha256 text not null,\n';
        sql += '\t uts bigint not null\n';
        sql += ')';
        dbFutureGlobal(sql, (ret, desc, rst) => {
            /* 创建一张表. */
            if (ret != 0x00) {
                console.error('create table tb_global_login_history failed, ret: ' + ret + ', desc: ' + desc);
                return;
            }
            console.info('create tb_global_login_history successful');
        });
        //
        let row = [
            {
                col: [
                    { type: DB_FILED_TYPE_TEXT, valText: 'usr00' }, //
                    { type: DB_FILED_TYPE_TEXT, valText: 'pwdSha256' }, //
                    { type: DB_FILED_TYPE_BIGINT, valInt: 123 }, //
                ],
            },
            {
                col: [
                    { type: DB_FILED_TYPE_TEXT, valText: 'usr01' }, //
                    { type: DB_FILED_TYPE_TEXT, valText: 'pwdSha256' }, //
                    { type: DB_FILED_TYPE_BIGINT, valInt: 123 }, //
                ],
            },
        ];
        dbFutureGlobalPrepare('insert into tb_global_login_history values (?, ?, ?)', row, (ret, desc, rst) => {
            /* 批量插入. */
            if (ret != 0x00) {
                console.error('insert into tb_global_login_history failed, ret: ' + ret + ', desc: ' + desc);
                return;
            }
            console.info('insert into tb_global_login_history successful, rst: ' + JSON.stringify(rst.toJSON()));
        });
        //
        dbFutureGlobal('select * from tb_global_login_history', (ret, desc, rst) => {
            if (ret != 0x00) {
                console.error('query tb_global_login_history failed, ret: ' + ret + ', desc: ' + desc);
                return;
            }
            for (let i = 0; i < rst.row.length; ++i) {
                console.log(
                    'row: ' +
                    i +
                    ', usr: ' +
                    getStrFromDbRst(rst, i, 'usr') +
                    ', pwdSha256: ' +
                    getStrFromDbRst(rst, i, 'pwdSha256') +
                    ', uts: ' +
                    getLongFromDbRst(rst, i, 'uts')
                );
            }
        });
    });
}

function jsonRsp(rsp) {
    return JSON.parse(JSON.stringify(rsp));
}

const fs = require('fs');
let XmsgImSdk = {
    name: 'XmsgImSdk',
    version: '1.0.0',
    netApiId: newNetApi('47.98.188.94:8080'),
    /* 通过指定的接入地址构造一个网络层的api实例. */
    dbApiId: null,
    isFirstAttach: true, //第一次附着
    usrToken: '',
    usrSecret: '',
    usrCgt: '',//当前用户的id
    usrName: '',//用户名
    cgt: '',//当前用户的cgt
    attachSuccess: false,
    isDetached: true, //是否初次附着
    store: {},//状态管理器
    router: {},//vue路由
    ver4usr: 0,
    ver4dept: 0,
    ver4deptUsr: 0,
    // 需要回复的请求名称
    requestBack: ["XmsgImOrgSyncPubReq"],
    tools: {
        jsonRsp: jsonRsp,
        getPbFromDbRst: getPbFromDbRst,
        sha256toLowerCase: function (raw) {
            return sha256toLowerCase(raw);
        },
        dbFutureGlobal: (sql, cb) => {
            dbFutureGlobal(sql /* 请求的sql. */, cb /* 响应或超时的callback. */);
        },
        dbFutureGlobalPrepare: (sql, row, cb) => {
            dbFutureGlobalPrepare(sql, row, cb)
        },
        dbFutureUsrOrgPrepare: (sql, row, cb) => {
            const dbApiId = this.parent.dbApiId
            dbFutureUsrOrgPrepare(dbApiId, sql, row, cb)
        },
        dbFutureUsrOrg: function (sql, cb) {
            const dbApiId = this.parent.dbApiId
 
            dbFutureUsrOrg(dbApiId, sql /* 请求的sql. */, cb /* 响应或超时的callback. */);
        },
        dbFutureUsrDatPrepare: function (sql, row, cb) {
            const dbApiId = this.parent.dbApiId
            dbFutureUsrDatPrepare(dbApiId, sql, row, cb)
        },
        dbFutureUsrDat: function (sql, cb) {
            const dbApiId = this.parent.dbApiId
            dbFutureUsrDat(dbApiId, sql /* 请求的sql. */, cb /* 响应或超时的callback. */);
        },
        getStrFromDbRst: getStrFromDbRst,
        getLongFromDbRst: getLongFromDbRst,
        // 创建目录，回调函数创建成功回调
        createMkdir(name, cb = new Function()) {
            fs.mkdir(name, function (err) {

                if (err) {

                }
                cb(err);
            });
        },


    },
    dbTools: {
        // 创建用户表，包含用户名，加密后的密码，时间戳
        createUserHistory() {
            let sql = `create table tb_global_login_history (
              usr text primary key not null,
              pwdSha256 text not null,
              cgt text not null,
              ver4usr text not null,
              uts bigint not null
             )`;
            dbFutureGlobal(sql, (ret, desc, rst) => {
                /* 创建一张表. */
                if (ret != 0x00) {
                    console.error('create table tb_global_login_history failed, ret: ' + ret + ', desc: ' + desc, sql);
                    return;
                }
                console.info('create tb_global_login_history successful');
            });
        }, createUsrOrgTb(dbApiId) {
            const self = this
            let sqlArr = [//用户表
                {
                    name: 'tb_org_usr', sql: `create table tb_org_usr (
                    cgt text primary key not null,
                    name text not null,
                    enable bigint not null,
                    info blob not null,
                    ver bigint not null,
                    gts bigint not null,
                    uts bigint not null
                   )`},
                // 部门表
                {
                    name: 'tb_org_dept', sql: `create table tb_org_dept (
                    cgt text primary key not null,
                    pcgt text,
                    name text not null,
                    enable bigint not null,
                    dispOrder bigint not null,
                    info blob not null,
                    ver bigint not null,
                    gts bigint not null,
                    uts bigint not null
                    )`}
                ,
                //  用户与部门关系表
                {
                    name: 'tb_org_dept_usr', sql: `create table tb_org_dept_usr (
                    dcgt text not null, 
                    ucgt text not null,                             
                    enable bigint not null,
                    dispOrder bigint not null,
                    info blob not null,
                    ver bigint not null,
                    gts bigint not null,
                    uts bigint not null,
                    primary key (dcgt, ucgt)
                   )`}
                ,];
            sqlArr.map(item => {
                dbFutureUsrOrg(dbApiId, item.sql, (ret, desc, rst) => {
                    if (ret == 0) {
                        self.parent.store.commit('setTableStatus', item.name)
                    } else {
                        alert(`创建表格失败,表名：${item.name}，描述：${desc}`)
                    }
                });
            })
        }, createGroupTabel(dbApiId) {
            //    const dbApiId=  this.parent.dbApiId
            const self = this
            const sqlArr = [
                // 组与用户的关系表
                {
                    name: 'tb_usr_group', sql: `create table tb_usr_group (
                    cgt text primary key not null,
                    enable bigint not null,
                    info text,
                    last_msg_time bigint,
                    last_msg text,
                    group_name text,
                    ver4usr bigint not null,
                    ver4group bigint not null,
                    gts4usr bigint not null,
                    uts4usr bigint not null,
                    gts4group bigint not null,
                    uts4group bigint not null
                     );`},
                //  群组成员表
                {
                    name: 'tb_usr_group_member', sql: `create table tb_usr_group_member (
                    gcgt text not null,
                    mcgt text not null,
                    private bigint not null,
                    enable bigint not null,
                    info text,
                    ver bigint not null,
                    gts bigint not null,
                    uts bigint not null, 
                    primary key (gcgt, mcgt)
                    )`}
                ,
                //  用户在群组上的一些`本地`个性设置.
                {
                    name: 'tb_usr_group_config', sql: `create table tb_usr_group_config (
                    cgt text primary key not null,
                    dispOrder bigint not null,
                    remind text not null,
                    extCfg text,
                    gts bigint not null,
                    uts bigint not null
                    )`}
                , //群组消息表
                {
                    name: 'tb_usr_group_msg', sql: `create table tb_usr_group_msg (
                    gcgt text not null,
                    scgt text not null,
                    msgId bigint not null,
                    msg text not null,
                    gts bigint not null,
                    isRead bigint not null,
                    primary key (gcgt, msgId)
                   )`}

            ]
            sqlArr.map(item => {
                dbFutureUsrDat(dbApiId, item.sql, (ret, desc, rst) => {
                    if (ret == 0) {
                        self.parent.store.commit('setTableStatus', item.name)
                    } else {
                        alert(`创建表格失败,表名：${item.name}，描述：${desc}`)
                    }
                });
            })
        }, saveUsr(data) {
            let row = data.map(item => {
                let info = JSON.stringify(item.usr.info)
                return {
                    col: [
                        { type: DB_FILED_TYPE_TEXT, valText: item.usr.cgt }, //
                        { type: DB_FILED_TYPE_TEXT, valText: item.usr.name }, //
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.enable },
                        { type: DB_FILED_TYPE_BLOB, valBlob: info },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.usr.ver },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.usr.gts },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.usr.uts },
                    ]

                }
            })
            const self = this
            dbFutureUsrOrgPrepare(this.parent.dbApiId, 'insert into tb_org_usr values (?, ?, ?,?,?,?,?)', row, (ret, desc, rst) => {
                /* 批量插入. */
                if (ret != 0x00) {
                    console.error('insert into tb_org_usr failed, ret: ' + ret + ', desc: ' + desc);
                    return;
                }
                if (data[data.length - 1].usr.var == self.ver4usr) {
                    // self.dbTools.createGroupTabel(self.dbApiId)
                    self.parent.store.commit('setorgSyncEnd', true)
                }

                console.info('insert into tb_org_usr successful, rst: ' + JSON.stringify(rst.toJSON()));
            });
        }, saveDept(data) {

            let row = data.map(item => {
                console.log(item)
                let info = JSON.stringify(item.dept.info)
                return {
                    col: [
                        { type: DB_FILED_TYPE_TEXT, valText: item.dept.cgt }, //
                        { type: DB_FILED_TYPE_TEXT, valText: item.dept.pcgt }, //
                        { type: DB_FILED_TYPE_TEXT, valText: item.dept.name }, //
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.dept.enable },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.dept.dispOrder },
                        { type: DB_FILED_TYPE_BLOB, valBlob: info },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.dept.ver },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.dept.gts },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.dept.uts },
                    ]

                }



            })

            dbFutureUsrOrgPrepare(this.parent.dbApiId, 'insert into tb_org_dept values (?, ?, ?,?,?,?,?,?,?)', row, (ret, desc, rst) => {
                /* 批量插入. */
                if (ret != 0x00) {
                    console.error('insert into tb_org_dept failed, ret: ' + ret + ', desc: ' + desc);
                    return;
                }
                console.info('insert into tb_org_dept successful, rst: ' + JSON.stringify(rst.toJSON()));
            });
        }, saveDept_Usr(data) {
            let row = data.map(item => {
                let info = JSON.stringify(item.deptUsr.info)
                return {
                    col: [
                        { type: DB_FILED_TYPE_TEXT, valText: item.deptUsr.dcgt }, //
                        { type: DB_FILED_TYPE_TEXT, valText: item.deptUsr.ucgt }, //  
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.deptUsr.enable },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.deptUsr.dispOrder },
                        { type: DB_FILED_TYPE_BLOB, valBlob: info },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.deptUsr.ver },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.deptUsr.gts },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.deptUsr.uts },
                    ]

                }



            })

            dbFutureUsrOrgPrepare(this.parent.dbApiId, 'insert into tb_org_dept_usr values (?, ?, ?,?,?,?,?,?)', row, (ret, desc, rst) => {
                /* 批量插入. */
                if (ret != 0x00) {
                    console.error('insert into tb_org_dept_usr failed, ret: ' + ret + ', desc: ' + desc);
                    return;
                }
                console.info('insert into tb_org_dept_usr successful, rst: ' + JSON.stringify(rst.toJSON()));
            });

        },//保存群组

        saveGroup(data, type) {
            let self = this
            if (type == 0) { //全量更新
                let row = data.map(item => {
                    let info = JSON.stringify(item.info)
                    return {
                        col: [
                            { type: DB_FILED_TYPE_TEXT, valText: item.cgt }, //    
                            { type: DB_FILED_TYPE_BIGINT, valInt: 0 }, //  
                            { type: DB_FILED_TYPE_TEXT, valText: info },
                            { type: DB_FILED_TYPE_BIGINT, valInt: 0 },
                            { type: DB_FILED_TYPE_TEXT, valText: '' },
                            { type: DB_FILED_TYPE_TEXT, valText: '' },
                            { type: DB_FILED_TYPE_BIGINT, valInt: item.ver4usr },
                            { type: DB_FILED_TYPE_BIGINT, valInt: 0 }, //此时还不知道群组的更多信息
                            { type: DB_FILED_TYPE_BIGINT, valInt: item.gts4usr },
                            { type: DB_FILED_TYPE_BIGINT, valInt: item.uts4usr },
                            { type: DB_FILED_TYPE_BIGINT, valInt: item.gts4group },
                            { type: DB_FILED_TYPE_BIGINT, valInt: 0 },  // 此时还不知道群组的更多信息
                        ]

                    }



                })
                /* 批量插入.群组 */
                dbFutureUsrDatPrepare(self.parent.dbApiId, 'insert into tb_usr_group values (?, ?, ?,?,?,?,?,?,?,?,?,?)', row, (ret, desc, rst) => {

                    if (ret != 0x00) {
                        console.error('insert into tb_usr_group failed, ret: ' + ret + ', desc: ' + desc);
                        return;
                    }
                    self.parent.store.commit('setGroupSyncStatus', true)

                });
            } else {
                data.map((item, i) => {

                    self.oneSaveGroup(item, item.oper, i, data.length)
                })
            }
            //   更新完群组进行群组消息同步  后期改成，所有群组同步完之后，就通过更新vuex状态进行全量群组消息同步


        },
        oneSaveGroup(data, type, index, length) {
            const i = index
            const len = length
            const self =this
            if (type == "insert") { //用户被加入了某个群
                let info = JSON.stringify(data.info)
                let row = [{
                    col: [
                        { type: DB_FILED_TYPE_TEXT, valText: data.cgt }, //    
                        { type: DB_FILED_TYPE_BIGINT, valInt: 0 }, //  
                        { type: DB_FILED_TYPE_BLOB, valBlob: info },
                        { type: DB_FILED_TYPE_BIGINT, valInt: 0 },
                        { type: DB_FILED_TYPE_TEXT, valText: '' },
                        { type: DB_FILED_TYPE_TEXT, valText: '' },
                        { type: DB_FILED_TYPE_BIGINT, valInt: data.ver4usr },
                        { type: DB_FILED_TYPE_BIGINT, valInt: 0 }, //此时还不知道群组的更多信息
                        { type: DB_FILED_TYPE_BIGINT, valInt: data.gts4usr },
                        { type: DB_FILED_TYPE_BIGINT, valInt: data.uts4usr },
                        { type: DB_FILED_TYPE_BIGINT, valInt: data.gts4group },
                        { type: DB_FILED_TYPE_BIGINT, valInt: 0 },  // 此时还不知道群组的更多信息
                    ]

                }]

                dbFutureUsrDatPrepare(this.parent.dbApiId, 'replace into tb_usr_group values (?, ?, ?,?,?,?,?,?,?,?,?,?)', row, (ret, desc, rst) => {
                    /* 批量插入. */
                    if (ret != 0x00) {
                        console.error('replace into tb_usr_group  failed, ret: ' + ret + ', desc: ' + desc);
                        return;
                    }
                    if (i == (len - 1))
                        self.parent.store.commit('setGroupSyncStatus', true)
                    console.info('replace into tb_usr_group successful, rst: ' + JSON.stringify(rst.toJSON()));
                });
            } else {
                let sql = `update tb_usr_group set enable = 1, ver4usr = ${data.ver4usr}, uts4usr = ${data.uts4usr} where cgt = ${data.cgt}`
                dbFutureUsrDat(this.parent.dbApiId, sql, (ret, desc, rst) => {
                    /* 批量插入. */
                    if (ret != 0x00) {
                        console.error('update tb_usr_group  failed, ret: ' + ret + ', desc: ' + desc);
                        return;
                    }
                    if (i == (len - 1))
                        self.parent.store.commit('setGroupSyncStatus', true)
                    console.info('update tb_usr_group successful, rst: ' + JSON.stringify(rst.toJSON()));
                });
            }
        },

    },
    // 初始化
    init: function (store, router) {

        // 保存页面数据共享实例
        this.store = store;
        this.router = router
        this.tools.parent = this;
        this.dbTools.parent = this;
        startupXmsgImClientFfi(() => {
            setSdkLogLevel("RECORD"); /* 设置底层日志级别. */
            subSdkLog(cxxLog => {
                // console.info("c++ log: " + cxxLog.log); /* 订阅c++ driver layer的日志. */
            });

            xmsgImClientSdkInit(); /* 初始化c++ driver. */
            this.netApiId = newNetApi('47.98.188.94:9001');
            //
            const self = this;
            this.netApiSubEvn(self.netApiId)
            this.netApiSubReq(self.netApiId)
            // 检查是否是初次安装,没有这个目录代表初次安装，则需要先创建目录
            self.tools.createMkdir('./dev5ClientDB', function (err) {
                // 创建并打开全局数据库
                if (openDbGlobal('./dev5ClientDB') != 0) {
          /* 在./db/目录下创建并打开全局数据库. */ console.error('open global database failed');
                    return;
                }
                if (err == null) {
                    // 创建历史登录用户表
                    self.dbTools.createUserHistory()

                } else {

                    console.log("不是初次使用")
                }



            });



            // if(this.attachSuccess)
            // 热更新登录，测试用
            // this.reloadlogin();
        });
    },
    /* 订阅网络层api实例上的事件, 包括本地事件与网络通知. */
    netApiSubEvn: function (netApiId) {
        const self = this
        netApiSubEvn(netApiId, notice => {

            if (notice.constructor.name == 'XmsgImSdkEventXmsgAp') {
				/* 如果是与x-msg-ap的信道建立事件, 且不是第一次attach. */ this.attachSuccess = false; /* 如果是XmsgImSdkEventXmsgAp事件, 一定是与x-msg-ap的信道刚建立或刚断开. */
                if (
                    notice.evn == 'estab' &&
                    !self.isFirstAttach /* 不是首次附着. */ &&
                    !self.isDetached /* 也没有主动去附着. */
                ) {
                    //

                    this.attach2xMsgAp(true);
                } else {

                }
            }
            if (notice.constructor.name == 'XmsgImGroupSyncNotice') {
                console.log('群组事件通知', jsonRsp(notice));
            }
            if (notice.constructor.name == 'XmsgImGroupMsgNotice') {
                console.log('消息通知', jsonRsp(notice));

                // 消息入库
                let data = jsonRsp(rsp)
                const sql2 = `insert into tb_usr_group_msg values (?, ?, ?, ?, ?, ?)`
                let row = data.msg.map(item => {
                    const isRead = item.scg == self.cgt ? 0 : item.isRead ? 0 : 1
                    return {
                        col: [
                            { type: DB_FILED_TYPE_TEXT, valText: cgt }, //    
                            { type: DB_FILED_TYPE_TEXT, valText: item.scg }, //  
                            { type: DB_FILED_TYPE_BIGINT, valInt: item.msgId },
                            { type: DB_FILED_TYPE_TEXT, valText: jsonRsp(item.msg) },
                            { type: DB_FILED_TYPE_BIGINT, valInt: item.gts },
                            { type: DB_FILED_TYPE_BIGINT, valInt: isRead },

                        ]

                    }

                });
                /* 批量插入消息入库 */
                dbFutureUsrDatPrepare(self.dbApiId, sql2, row, (ret, desc, rst) => {

                    if (ret != 0x00) {
                        console.error('insert into tb_usr_group_msg failed, ret: ' + ret + ', desc: ' + desc);
                        return;
                    }

                    console.info('insert into tb_usr_group_msg successful, rst: ' + JSON.stringify(rst.toJSON()));
                });


            }
            if (notice.constructor.name == 'XmsgImGroupMsgReadNotice') {
                console.log('消息已读通知', jsonRsp(notice));
            }
        });
    },

    /* 订阅网络api实例上的网络请求(需要回送响应). */

    netApiSubReq: function (netApiId) {
        const self = this
        netApiSubReq(netApiId, (trans, req) => {
            // console.log("got a net-api network request, msg: " + req.constructor.name + ", dat: " + JSON.stringify(req.toJSON()));
            trans.ret = 0x00;

            if (req.constructor.name === "XmsgImOrgSyncPubReq") { //组织架构更新

                const data = jsonRsp(req.event)
                console.log(data)
                if (data[0] != undefined && data[0].deptUsr != undefined) {

                    this.dbTools.saveDept_Usr(data)


                }
                if (data[0] != undefined && data[0].dept != undefined) {
                    this.dbTools.saveDept(data)

                }
                if (data[0] != undefined && data[0].usr != undefined) {
                    this.dbTools.saveUsr(data)

                }

            }


            if (self.requestBack.indexOf(req.constructor.name) != -1) {

                trans.tid = trans.tid;
                trans.ret = 0x00;
                trans.desc = null;
                trans.rsp = xmsgim.XmsgImOrgSyncPubRsp.create({ ext: 'accept' }); /* 提交一个response的pb对象. */

                // self.store.commit('setChatList', jsonRsp(req.event))
            }
            netApiTransEnd(trans);
        });

    },
    // 热更新登录
    reloadlogin() {
        this.login(localStorage.getItem('usr'), localStorage.getItem('password'), (ret, desc, rsp) => {
            console.log(`热更新登录====ret:${ret}====desc:${desc}`);
        });
    },
    //登录
    login(usr, password, cb = new Function()) {
        // 热更新密码保存
        const self = this;
        localStorage.setItem('usr', usr);
        localStorage.setItem('password', password);
        this.usrName = usr
        let pwdSha256 = sha256toLowerCase(password);

        let salt = 'saltsalt';
        let sign = sha256toLowerCase(usr + salt + pwdSha256);
        let req = xmsgim.XmsgImAuthSimpleReq.create({
            usr: usr,
            salt: salt,
            sign: sign,
            dev: { plat: 'windows', did: '0.0.0.0', ver: '0.0.0' },
        }); /* 鉴权. */

        netFuture(this.netApiId, req, function (ret, desc, rsp) {
            const jsonRsp = JSON.parse(JSON.stringify(rsp));
            console.log(ret)
            if (ret == 0) {

                self.usrToken = jsonRsp.token;
                self.usrSecret = jsonRsp.secret;
                self.cgt = jsonRsp.cgt;
                self.attach2xMsgAp(false, salt, pwdSha256, cb);
                // cb(ret, desc, jsonRsp)
            }
        });
    },
    // 附着
    attach2xMsgAp(Again, salt, pwdSha256, cb) {

        if (this.attachSuccess) return;
        const self = this;
        let secret;
        if (!Again) {
            secret = aes128decFromHexStrLowerCase(salt + pwdSha256, self.usrSecret); /* 解密密钥. */
        } else {
            secret = self.usrSecret;
        }

        const sign = sha256toLowerCase(self.usrToken + salt + secret); /* 签名. */
        const req = xmsgim.XmsgImHlrAttachSimpleReq.create({
            token: self.usrToken,
            salt: salt,
            sign: sign,
            alg: 'none',
            cgt: self.cgt,
        });
        netFuture(this.netApiId, req, function (ret, desc, resp) {
            if (ret != 0) {
                //
                alert('attach to x-msg-ap failed, ret: ' + ret + ', desc:  ' + desc);
                return;
            } else {

                cb(ret, desc, resp);

                self.isFirstAttach = false;

                self.attachSuccess = true; /* attach成功, 接下来就可以开始业务了. */

                self.usrCgt = self.cgt.split('@')[1];

                self.dbApiId = newDbApi(self.usrCgt);
                //判断这个用户是否登录过，没有则进行基础表创建
                self.tools.createMkdir('./dev5ClientDB/' + self.usrCgt, function (err) {

                    // if (err) {
                    const selectGroupVer = `select * from
                        tb_global_login_history 
                        where cgt = "${self.usrCgt}"`
                    dbFutureGlobal(selectGroupVer, function (ret, desc, rsp) {
                        if (jsonRsp(rsp).row == undefined) {
                            let row = [
                                {
                                    col: [
                                        { type: DB_FILED_TYPE_TEXT, valText: self.usrName }, //
                                        { type: DB_FILED_TYPE_TEXT, valText: pwdSha256 }, //
                                        { type: DB_FILED_TYPE_TEXT, valText: self.usrCgt }, //
                                        { type: DB_FILED_TYPE_BIGINT, valInt: 0 }, //
                                        { type: DB_FILED_TYPE_BIGINT, valInt: new Date().getTime() }, //
                                    ],
                                },

                            ];
                            dbFutureGlobalPrepare('insert into tb_global_login_history values (?, ?, ?,?,?)', row, (ret, desc, rst) => {
                                /* 批量插入. */
                                if (ret != 0x00) {
                                    console.error('insert into tb_global_login_history failed, ret: ' + ret + ', desc: ' + desc);
                                    return;
                                }
                                console.info('insert into tb_global_login_history successful, rst: ' + JSON.stringify(rst.toJSON()));
                            });
                            // 创建组织架构表
                            self.dbTools.createUsrOrgTb(self.dbApiId)
                            // 创建群组表
                            self.dbTools.createGroupTabel(self.dbApiId)


                        } else {

                            for (const key in self.store.state.tableStatus) {
                                if (self.store.state.tableStatus.hasOwnProperty(key)) {
                                    self.store.commit('setTableStatus', key)

                                }
                            }
                        }
                    })
                });
            }
        });
    },

    // 去附着请求:
    XmsgImHlrDetachSimpleReq(cb = new Function()) {
        const self = this;
        let req = xmsgim.XmsgImHlrDetachSimpleReq.create({ cgt: self.cgt });
        netFuture(this.netApiId, req, cb);
    },
    // 组织架构同步
    XmsgImOrgSyncSubReq(ver4usr = 0, ver4dept = 0, ver4deptUsr = 0, cb = new Function()) {
        const self = this
        let req = xmsgim.XmsgImOrgSyncSubReq.create({ ver4usr: ver4usr, ver4dept: ver4dept, ver4deptUsr: ver4deptUsr });

        netFuture(this.netApiId, req, function (ret, desc, rsp) {
            if (ret == 0) {

                const data = jsonRsp(rsp)
                self.ver4usr = data.ver4usrLatest
                self.ver4dept = data.ver4deptLatest
                self.ver4deptUsr = data.ver4deptUsrLatest
                if (ver4usr == data.ver4usrLatest && ver4dept == data.ver4deptLatest && ver4deptUsr == data.ver4deptUsrLatest) {
                    self.store.commit('setorgSyncEnd', true)
                }
                console.log("组织架构同步成功：",data)
                cb(ret, desc, rsp);
            } else {
                console.log('==组织架构同步失败desc==', desc);
                console.log('==组织架构同步失败rsp==', rsp);
                console.log('==组织架构同步失败ret==', ret);
            }
        });

    },
    // 消息发送
	/**
     * {
            XmsgImMsg:{type:'text',text:{XmsgImMsgText:{msg:'x-msg-im是最好的即时通讯平台'} }}
        }
     * 
     * 
     * @param {*} cgt 
     * @param {*} text 
     */
    XmsgImGroupSendMsgReq(cgt, msg, cb = new Function()) {
        let req = xmsgim.XmsgImGroupSendMsgReq.create({
            cgt: cgt,
            localMsgId: parseInt(Math.random() * 100000),
            msg: msg
            //  此处text在下版本中要改成msf
            // msg: { type: 'text', msg: { text: text } },
        });

        netFuture(this.netApiId, req, function (ret, desc, rsp) {
            if (ret == 0) {
                // cb(rsp)
                console.log(rsp, '消息发送成功回调===================');
                cb(ret, desc, rsp)
            } else {
                console.log('==消息发送失败desc==', desc);
                console.log('==消息发送失败rsp==', rsp);
                console.log('==消息发送失败ret==', ret);
            }
        });
    },
    // 消息已读
    XmsgImGroupMsgReadReq(obj, cb = new Function()) {
        let req = xmsgim.XmsgImGroupMsgReadReq.create(obj);

        netFuture(this.netApiId, req, function (ret, desc, rsp) {
            if (ret == 0) {
                console.log(rsp, '消息已读');
                cb(ret, desc, rsp);
            } else {
                console.log('==消息已读desc==', desc);
                console.log('==消息已读失败rsp==', rsp);
                console.log('==消息已读失败ret==', ret);
            }
        });
    },
    // 查询节点信息  
    XmsgImOrgNodeQueryReq(cgt) {
        let req = xmsgim.XmsgImOrgNodeQueryReq.create({
            cgt: cgt,
        });

        netFuture(this.netApiId, req, function (ret, desc, rsp) {
            if (ret == 0) {
                console.log(rsp, '查询节点信息');
                // cb(ret, desc, rsp)
            } else {
                console.log('==查询节点信息失败desc==', desc);
                console.log('==查询节点信息失败rsp==', rsp);
                console.log('==查询节点信息失败ret==', ret);
            }
        });
    },
    // 查询子节点信息
    XmsgImOrgNodeChildQueryReq(cgt, cb) {
        let req = xmsgim.XmsgImOrgNodeChildQueryReq.create({
            cgt: cgt,
        });

        const self = this;
        netFuture(this.netApiId, req, function (ret, desc, rsp) {
            if (ret == 0) {
                console.log(rsp, '查询子节点信息');
                let json = jsonRsp(rsp);
                cb(ret, desc, json.child)
            } else {
                console.log('==查询子节点信息失败desc==', desc);
                console.log('==查询子节点信息失败rsp==', rsp);
                console.log('==查询子节点信息失败ret==', ret);
            }
        });
    },
    // 消息同步
    XmsgImGroupMsgSyncReq(
        cgt,
        msgId = 10,
        cb = new Function()
    ) {
        let req = xmsgim.XmsgImGroupMsgSyncReq.create({ cgt: cgt, msgId: msgId });

        netFuture(this.netApiId, req, function (ret, desc, rsp) {
            if (ret == 0) {

                console.log(JSON.parse(JSON.stringify(rsp)), '消息同步信息');

               
            } else {
                console.log('==消息同步失败desc==', desc);
                console.log('==消息同步失败rsp==', rsp);
                console.log('==消息同步失败ret==', ret);
            }
            cb(ret, desc, rsp);
        });
    },
    // 消息查询
    XmsgImGroupMsgQueryReq(cgt, msgId, before = false, pageSize = 100, cb = new Function()) {
        const self = this
        let req = xmsgim.XmsgImGroupMsgQueryReq.create(
            { cgt: cgt, msgId: msgId, before: before, pageSize: pageSize });

        netFuture(self.netApiId, req, function (ret, desc, rsp) {

            let data = jsonRsp(rsp)
            cb(ret, desc, data)

        });
    },
    // 群组同步
    XmsgImGroupSyncReq(ver4usr = 0, cb = new Function()) {
        let req = xmsgim.XmsgImGroupSyncReq.create({ ver4usr: ver4usr });
        const self = this;

        netFuture(this.netApiId, req, function (ret, desc, rsp) {
            if (ret == 0) {

                self.dbTools.saveGroup(jsonRsp(rsp).event, ver4usr)

                cb(ret, desc, rsp);
            } else if (ret === 18) {
                self.store.commit('setGroupSyncStatus', true)

                console.log("=============无更新==================")
            } else {
                console.log('==群组同步失败desc==', desc);
                console.log('==群组同步失败rsp==', rsp);
                console.log('==群组同步失败ret==', ret);
            }
        });
    },
    //查本地版进行群组同步
    queryVerGroupSyncReq() {

        let sql = "select max(ver4usr) from tb_usr_group";
        const self = this
        XmsgImSdk.tools.dbFutureUsrDat(sql, (ret, desc, rst) => {
            if (ret != 0) {
                console.error("查询tb_usr_group max(ver4usr)失败:" + desc);
                self.XmsgImGroupSyncReq(0)
                return;
            }
            for (let i = 0; i < rst.row.length; ++i) {
                self.XmsgImGroupSyncReq(XmsgImSdk.tools.getLongFromDbRst(rst, i, 'max(ver4usr)'))
            }
        });
    },
    // 查数据库同步组内信息
    syncGroupInfo() {
        const self = this
        dbFutureUsrDat(this.dbApiId, "select cgt,ver4group from tb_usr_group where enable=0", (ret, desc, rst) => {/* 查找所有未被禁用的群组. */
            if (ret != 0) {
                console.error("database exception, ret: %s, desc: %s", ret, desc);
                return;
            }
            MSG_SYNC__TOTAL_NUM = rst.row.length
            MSG_SYNC_NUM = 0
            for (let i = 0; i < MSG_SYNC__TOTAL_NUM; i++) {

                const ver = getLongFromDbRst(rst, i, 'ver4group') == '' ? 0 : getLongFromDbRst(rst, i, 'ver4group')
                // 群组事件同步
                self.XmsgImGroupSyncGroupReq(getStrFromDbRst(rst, i, 'cgt'), ver)
            }

        });
    },
    // 群组信息查询 
    XmsgImGroupInfoQueryReq(cgt="im.xmsg.dev5.cn.szg0#8027674288024334828a147a4f3c025b", member = true, cb = new Function()) {
        let req = xmsgim.XmsgImGroupInfoQueryReq.create({ cgt: cgt, member: member });
        const self = this
        netFuture(this.netApiId, req, function (ret, desc, rsp) {
            if (ret == 0) {
                console.log(JSON.parse(JSON.stringify(rsp)), '群组信息查询');
                let jsonRsp = JSON.parse(JSON.stringify(rsp));


                // self.XmsgImGroupSyncGroupReq(jsonRsp.info.cgt, jsonRsp.info.ver) //   群组内事件同步返回 channel global title format error: im.xmsg.dev5.cn.szg0#ee74498b379c4ec98fe6192191a27700

                cb(ret, desc, rsp);

            } else {
                console.log('==群组信息查询desc==', desc);
                console.log('==群组信息查询rsp==', rsp);
                console.log('==群组信息查询ret==', ret);
            }
        });
    },
    // 查询他人用户信息
    XmsgImHlrOtherUsrInfoQueryReq(cgt, cb = new Function()) {
        let req = xmsgim.XmsgImHlrOtherUsrInfoQueryReq.create({
            cgt: cgt,
        });

        netFuture(this.netApiId, req, function (ret, desc, rsp) {
            if (ret == 0) {
                // console.log(JSON.parse(JSON.stringify(rsp)), "消息发送")
                console.log(JSON.parse(JSON.stringify(rsp)), '查询他人用户信息===================');
                cb(ret, desc, rsp);
            } else {
                console.log('==查询他人用户信息desc==', desc);
                console.log('==查询他人用户信息rsp==', rsp);
                console.log('==查询他人用户信息ret==', ret);
            }
        });
    },

    // 群组内事件同步
    XmsgImGroupSyncGroupReq(cgt, ver, cb = new Function()) {
       
        let req = xmsgim.XmsgImGroupSyncGroupReq.create({ cgt: cgt, ver: ver });

        const self = this
        netFuture(this.netApiId, req, function (ret, desc, rsp) {

            console.log("XmsgImGroupSyncGroupReq=====================",desc,rsp)
            if (ret == 0x0012) /* 没有任何更新. */ {
                // console.log("local group data is latest, no need sync any more, gcgt: %s", cgt);

                self.groupXmsgImGroupMsgSyncReq(cgt)/* 同步组内消息. */

                return;
            }
            if (ret == 0x000E) /* 群里面已经没有任何, 且没有任何群组自身信息变更. */ {
                console.log("group have no member, cgt: %s", cgt);
                self.groupXmsgImGroupMsgSyncReq(cgt) /* 同步组内消息. */
                return;
            }
            if (ret != 0) {
                console.log("sync group info failed, ret: %s, desc: %s, gcgt: %s", ret, desc, gcgt);
                return;
            }
            let data = jsonRsp(rsp);

            if (data.info) {
                let json = {
                    info: data.info.info,
                    ver4group: data.info.ver > data.member[data.member.length - 1].ver ? data.info.ver : data.member[data.member.length - 1].ver,
                    uts: data.info.uts,
                    gcgt: cgt
                }
                // 更新群组信息
                console.log(json,"更新群组信息")
                self.updateGroupInfo2db(json)
            }
            if (data.member && data.member.length != 0) {
                //更新群员信息
                console.log("群成员变动", cgt, ver)
                console.log(data)
                self.updateGroupMember2db(data.member, cgt, data.info.info.private==undefined ? 0 : 1)
            }
            // 群组消息同步
            self.groupXmsgImGroupMsgSyncReq(cgt)
            cb(ret, desc, rsp);

        });
    },

    // 更新数据库信息im.xmsg.dev5.cn.szg0#93aacd35692b4645975567557cf39a49
    updateGroupInfo2db(json) {

        const sql = `update tb_usr_group set info = '${JSON.stringify(json.info)}', ver4group = '${json.ver4group}', uts4group = '${json.uts}' where cgt = '${json.gcgt}'`

        dbFutureUsrDat(this.dbApiId, sql, function (ret, desc, rsp) {
            // console.log("更新数据库群组信息",ret,desc, rsp)

        })

    },
    //更新群组成员信息至本地数据库  private=0代表是双人单聊群
    updateGroupMember2db(member, gcgt, type = 0) {
        console.log(gcgt,"=============gcgt==========")
        const sql = `replace into tb_usr_group_member values (?, ?, ?, ?, ?, ?, ?,?)`

        let row = []
        const self = this
        for (let i = 0; i < member.length; i++) {
            const item = member[i];
            if (item.cgt != this.cgt) { //入库群成员不包括自己
                if (type == 0 && ('upsert' == item.oper)) {
                    self.updateGroupNameDB(gcgt, item.cgt)
                }
                console.log("upsert=============================", item)
                row.push({
                    col: [
                        { type: DB_FILED_TYPE_TEXT, valText: gcgt }, //
                        { type: DB_FILED_TYPE_TEXT, valText: item.cgt }, // 
                        { type: DB_FILED_TYPE_BIGINT, valInt: type }, //private
                        { type: DB_FILED_TYPE_BIGINT, valInt: 'upsert' == item.oper },
                        { type: DB_FILED_TYPE_TEXT, valText: JSON.stringify(item.info) },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.ver },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.gts },
                        { type: DB_FILED_TYPE_BIGINT, valInt: item.uts },
                    ]

                })
            }

        }
        console.log(row,"更新群组成员信息至本地数据库")
        dbFutureUsrDatPrepare(this.dbApiId, sql, row, function (ret, desc, rsp) {
            console.log("更新群组成员信息至本地数据库", ret, desc, rsp)

        })

    },
    //群组内消息，查本地数据库最大的消息id进行同步
    groupXmsgImGroupMsgSyncReq(cgt,cb=new Function()) {
        const self = this
        let sql = `select max(msgId) from tb_usr_group_msg where gcgt='${cgt}'`
        dbFutureUsrDat(this.dbApiId, sql, (ret, desc, rst) => {
            if (ret != 0) {
                console.error("database exception, ret: %s, desc: %s", ret, desc);
                return;
            }

            let msgId = 0

            for (let i = 0; i < rst.row.length; ++i) {
                msgId = getLongFromDbRst(rst, i, 'max(msgId)').length == 0 ? 0 : getLongFromDbRst(rst, i, 'max(msgId)')
            }

            console.log(msgId,rst,'msgId==========================================')
            // 消息查询接口
            // self.XmsgImGroupMsgQueryReq(cgt, msgId, false, 100, function (ret, desc, rsp) {
            //     cb(ret)
            //     if (ret == 0x0012 || rsp == null) /* 没有新的消息产生. */ {
            //         self.changeSyncMsgNum()
            //         console.info("no message need to sync, group: %s, local max message id: %d", cgt, msgId);
            //         return;
            //     }
            //     if (rsp.msg.length == 100) {
            //         self.XmsgImGroupMsgQueryReq(cgt, rsp.msg[rsp.msg.length - 1].msgId)
            //     }
            //     if (ret != 0) {
            //         self.changeSyncMsgNum()
            //         console.info("消息查询接口失败", desc, ret);
            //         return;
            //     }

            //     const sql2 = `insert into tb_usr_group_msg values (?, ?, ?, ?, ?, ?)`
            //     let row = rsp.msg.map(item => {
            //         // const isRead = item.scg == self.cgt ? 0 : item.isRead ? 0 : 1
            //         const isRead = 0

            //         return {
            //             col: [
            //                 { type: DB_FILED_TYPE_TEXT, valText: cgt }, //    
            //                 { type: DB_FILED_TYPE_TEXT, valText: item.scgt }, //  
            //                 { type: DB_FILED_TYPE_BIGINT, valInt: item.msgId },
            //                 { type: DB_FILED_TYPE_TEXT, valText: JSON.stringify(item.msg) },
            //                 { type: DB_FILED_TYPE_BIGINT, valInt: item.gts },
            //                 { type: DB_FILED_TYPE_BIGINT, valInt: isRead },
            //             ]
            //         }

            //     });
            //     // 每一页数据都取最后一天插入群组表中

            //     let msg = ''
            //     if (rsp.msg[rsp.msg.length - 1].msg.type == "text") {
            //         console.log(rsp.msg[rsp.msg.length - 1].msg)
            //         if (msg = rsp.msg[rsp.msg.length - 1].msg.text != undefined)
            //             msg = rsp.msg[rsp.msg.length - 1].msg.text.text
            //     } else {
            //         msg = `[${rsp.msg[rsp.msg.length - 1].msg.type}]`
            //     }
            //     const tb_usr_group_sql = `update tb_usr_group set last_msg="${encodeURIComponent(msg)}",
            //     last_msg_time="${rsp.msg[rsp.msg.length - 1].gts}" where cgt="${cgt}"`

            //     dbFutureUsrDat(self.dbApiId, tb_usr_group_sql, function (ret, desc, rsp2) {
            //         console.log(JSON.stringify(rsp.msg[rsp.msg.length - 1].msg))
            //         console.log(rsp.msg[rsp.msg.length - 1].msg)
            //         console.log(desc, "==============================插入最后一条信息到表中=======")

            //     })
            //     dbFutureUsrDatPrepare(self.dbApiId, sql2, row, (ret, desc, rst) => {
            //         /* 批量插入. */
            //         self.changeSyncMsgNum()
            //         if (ret != 0x00) {
            //             console.error('insert into tb_usr_group_msg failed, ret: ' + ret + ', desc: ' + desc);
            //             return;
            //         }
                    

            //         console.info('insert into tb_usr_group_msg successful, rst: ' + JSON.stringify(rst.toJSON()));
            //     });


            // })
            // 消息同步接口   ps:消息暂时无法同步，暂时注释用消息查询代替
            self.XmsgImGroupMsgSyncReq(cgt, msgId, function (ret, desc, rsp) {
                // 入库
                if (ret ==14) /* 没有新的消息产生. */ {
                    self.changeSyncMsgNum()
                    console.info("no message need to sync, group: %s, local max message id: %d", cgt, msgId);
                    return;
                }

                let data = jsonRsp(rsp)
                
                console.log(data)
                const sql2 = `insert into tb_usr_group_msg values (?, ?, ?, ?, ?, ?)`
                let row = data.msg.map(item => {
            
                    const isRead = item.scgt == self.cgt ? 0 : item.isRead ? 0 : 1
                    return {
                        col: [
                            { type: DB_FILED_TYPE_TEXT, valText: cgt }, //    
                            { type: DB_FILED_TYPE_TEXT, valText: item.scgt }, //  
                            { type: DB_FILED_TYPE_BIGINT, valInt: item.msgId },
                            { type: DB_FILED_TYPE_TEXT, valText: JSON.stringify(item.msg) },
                            { type: DB_FILED_TYPE_BIGINT, valInt: item.gts },
                            { type: DB_FILED_TYPE_BIGINT, valInt: isRead },

                        ]

                    }

                });
                 // 每一次同步的数据都取最后一条插入群组表中

                let msg = ''
                if (rsp.msg[rsp.msg.length - 1].msg.type == "text") {
                    console.log(rsp.msg[rsp.msg.length - 1].msg)
                    if (msg = rsp.msg[rsp.msg.length - 1].msg.text != undefined)
                        msg = rsp.msg[rsp.msg.length - 1].msg.text.text
                } else {
                    msg = `[${rsp.msg[rsp.msg.length - 1].msg.type}]`
                }
                const tb_usr_group_sql = `update tb_usr_group set last_msg="${encodeURIComponent(msg)}",
                last_msg_time="${rsp.msg[rsp.msg.length - 1].gts}" where cgt="${cgt}"`

                dbFutureUsrDat(self.dbApiId, tb_usr_group_sql, function (ret, desc, rsp2) {
                
                    console.log(desc, "==============================插入最后一条信息到表中=======")

                })
               
                dbFutureUsrDatPrepare(self.dbApiId, sql2, row, (ret, desc, rst) => {
                    /* 批量插入. */
                    self.changeSyncMsgNum()
                    if (ret != 0x00) {
                        console.error('insert into tb_usr_group_msg failed, ret: ' + ret + ', desc: ' + desc);
                        return;
                    }

                    console.info('insert into tb_usr_group_msg successful, rst: ' + JSON.stringify(rst.toJSON()));
                });

            });
        });

    },
    // 同步群组消息名字
    changeSyncMsgNum() {
        ++MSG_SYNC_NUM
        if (MSG_SYNC_NUM >= MSG_SYNC__TOTAL_NUM) {
            this.store.commit('setMsgSyncStatus', true)
            this.getChatGroup()
        }
    },
    // 更新群info增加私聊群名称名字
    updateGroupNameDB(gcgt, cgt) {
        const sql = `select name from tb_org_usr where cgt='${cgt}'`

        const self = this
        dbFutureUsrOrg(this.dbApiId, sql, function (ret, desc, rsp) {
            if (ret == 0) {
                console.log("更新群info增加私聊群名称名字=================", rsp)
                for (let i = 0; i < rsp.row.length; ++i) {
                    const sql2 = `update tb_usr_group set group_name='${getStrFromDbRst(rsp, i, 'name')}' where cgt='${gcgt}'`
                    dbFutureUsrDat(self.dbApiId, sql2, new Function())
                }


            }
        })
    },
    //获取常用群
    getChatGroup() {
        const sql = `select group_name,cgt,last_msg,last_msg_time,info from tb_usr_group  ORDER BY last_msg_time`
        const self = this
        dbFutureUsrDat(this.dbApiId, sql, function (ret, desc, rsp) {
            if (ret == 0) {
                let arr = []
                for (let i = 0; i < rsp.row.length; i++) {
                    const name =getStrFromDbRst(rsp, i, 'group_name')
                    if(name==0)
                    {
                        continue
                        sql2=`select cgt`
                    }
                    
                    const obj = {
                        name: getStrFromDbRst(rsp, i, 'group_name'),
                        cgt: getStrFromDbRst(rsp, i, 'cgt'),
                        last_msg: decodeURIComponent(getStrFromDbRst(rsp, i, 'last_msg')),
                        last_msg_time: getStrFromDbRst(rsp, i, 'last_msg_time'),
                        info: getStrFromDbRst(rsp, i, 'info'),
                        img:Math.floor(Math.random() * (120 - 1 + 1)) + 1,
                    }
                    
                    arr.push(obj)
                     
                }
                self.store.commit('setXmsgChatLis', arr)

            }
        })
    },
    // 创建群
    XmsgImGroupCreateReq(obj,cb) {
        let req = xmsgim.XmsgImGroupCreateReq.create(obj);

        netFuture(this.netApiId, req, function (ret, desc, rsp) {

            let data = jsonRsp(rsp)
            cb(ret, desc, data)

        });
    }
};

module.exports = XmsgImSdk;
