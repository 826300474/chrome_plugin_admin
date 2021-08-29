var express = require('express');
var router = express.Router();

const mysql = require('mysql')

// 创建数据库连接
const conn = mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-9jcsu5mm.sql.tencentcdb.com',
    port: '21681',
    user: 'root',
    password: 'Chai826300474',
    database: 'chrome_plugin'
});

router.get('/', function (req, res, next) {
    var sql = `select * from page where url='${req.query.href}'`;
    conn.query(sql, function (err,result) {
        if(err){
            console.log('[SELECT ERROR]:',err.message);
        }
        if( result && result.length > 0 ){  
            const page = result[0];
            var sql1 = `select * from interfce where pageId=${page.key}`;
            conn.query(sql1, function (err,result) {
                res.json(
                    {
                        success: true,
                        data:result,
                        message: '查询成功'
                    }
                );
            })
        }else{
            res.json(
                {
                    success: false,
                    data:null,
                    message: '暂无数据'
                }
            );
        }
        
    });
});

router.post('/', function (req, res, next) {
    const list = JSON.parse(req.body.data);

    list.forEach(item => {
        const tableName = item.pageData.tableName;
        if(tableName){
            const values = [item.method,item.url,item.params,item.content,item.other_params];
            conn.query(`select * from information_schema.tables where table_name ='${tableName}'`,function(err,result){
                if( result && result.length > 0 ){
                    createRecord(values,req, res, next,tableName);
                }else{
                    conn.query("CREATE TABLE "+ tableName +" (`method` varchar(255) DEFAULT NULL,`url` varchar(255) DEFAULT NULL,`params` varchar(255) DEFAULT NULL,`content` longtext,`other_params` varchar(255) DEFAULT NULL,`key` int(255) NOT NULL AUTO_INCREMENT,`create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (`key`)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8",
                        function(err,result){
                            if( err ){

                            }else{
                                createRecord(values,req, res, next,tableName);
                            }
                    })
                }   
            })
        }
    });
});

function createRecord(values,req, res, next,tableName){
    conn.query('INSERT INTO '+ tableName +'(`method`, `url`, `params`,`content`,`other_params`) VALUES (?,?,?,?,?)',values, function (err,result) {
        console.log(err,result);
        if(err){
            res.json(
                {
                    success: false,
                    data:null,
                    message: err.message
                }
            );
        }
        res.json(
            {
                success: true,
                data:result,
                message: '添加成功'
            }
        );
    });
}

module.exports = router;
