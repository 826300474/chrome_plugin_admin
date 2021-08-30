var express = require('express');
var router = express.Router();
var dbConfig = require('../db.config'); 
const MYSQL = require('mysql')
var Mysql = require('node-mysql-promise');
var mysql = Mysql.createConnection(dbConfig);

router.get('/', function (req, res, next) {
    mysql.table('page').where(`url = '${req.query.href}'`).select().then(function (result) {
        if( result && result.length > 0 ){
            const page = result[0];
            mysql.table('interfce').where(`pageId = '${page.key}'`).select().then(data => {
                res.json(
                    {
                        success: true,
                        data:data,
                        message: '查询成功'
                    }
                );
            }).catch(e => {
                console.log(e);
                res.json(
                    {
                        success: true,
                        data:null,
                        message: e
                    }
                );
            })
        }
    }).catch(function (e) {
        console.log(e);
        res.json(
            {
                success: true,
                data:null,
                message: e
            }
        );
    });
});

router.post('/', function (req, res, next) {
    const list = JSON.parse(req.body.data);

    list.forEach((item,index) => {
        const tableName = item.pageData.tableName;
        if(tableName){
            const values = {
                method:item.method,
                url:item.url,
                params:item.params,
                content:item.content,
                other_params:item.other_params
            }
            mysql.query(`select * from information_schema.tables where table_name ='${tableName}'`).then(function (result) {
                if( result && result.length > 0 ){
                    createRecord(values,req, res, next,tableName,index);
                }else{
                    const conn = MYSQL.createConnection(dbConfig);
                    conn.connect();
                    conn.query("CREATE TABLE "+ tableName +" (`method` varchar(255) DEFAULT NULL,`url` varchar(255) DEFAULT NULL,`params` varchar(255) DEFAULT NULL,`content` longtext,`other_params` varchar(255) DEFAULT NULL,`key` int(255) NOT NULL AUTO_INCREMENT,`create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (`key`)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8",
                        function(err,result){
                            if( err ){

                            }else{
                                createRecord(values,req, res, next,tableName,index);
                            }
                    })
                }
            })
        }
    });
});

function createRecord(values,req, res, next,tableName){
    var where = {
        params:values.params,
        content:values.content,
        other_params:values.other_params
    }
    mysql.table(tableName).thenAdd(values,where).then(function (insertId) {
        if( index === 0 ){
            res.json(
                {
                    success: true,
                    data:insertId,
                    message: '添加成功'
                }
            );
        }
    }).catch(function (err) {
        console.log(err);
            res.json(
                {
                    success: false,
                    data:null,
                    message: err
                }
            );
    })
}
module.exports = router;
