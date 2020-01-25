//------------------------------------------Module-------------------------------------------
//module bawaan/default atau tidak perlu install
var http  = require('http');
var url   = require('url');
var qString   = require('querystring');
//module yang perlu install terlebih dahulu
var router = require('routes')();
var view  = require('swig');

//object dan mongodb
var ObjectId = require('objectid')
var MongoClient = require('mongodb').MongoClient;


//----------------------------------------Database-------------------------------------------
var uri = "mongodb://localhost:27017";


//------------------------------------------Route--------------------------------------------
//index
router.addRoute('/',function(req,res){
    var html=view.compileFile('./templates/index.html')({
        title:"Index",
    });
    res.writeHead(200,{"Content-Type" : "text/html"});
    res.end(html);
});

//buku
router.addRoute('/buku',function(req,res){
    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
            var dbo = db.db("mywebsite_crud").collection("buku");
            dbo.find({}).toArray(function(err, result) {

            //solusi agar id tidak menjadi [object Object] pada view/parameter
            var data_json=JSON.stringify(result) //untuk mengubah javascript array menjadi string JSON
            var data_objt=JSON.parse(data_json) //untuk mengubah string JSON menjadi javascript object.
            if (err) throw err;
                var html=view.compileFile('./templates/buku.html')({
                    title:"Buku",
                    data : data_objt,
                });
                db.close();
                
                res.writeHead(200,{"Content-Type" : "text/html"});
                res.end(html);
            });
        
      });
    
});

//tambah
router.addRoute('/buku/tambah',function(req,res){
    if(req.method.toUpperCase()=='POST'){
        var data_post="";
        req.on('data',function(chuncks){
            data_post += chuncks;
        });
        req.on('end',function(){
            data_post =qString.parse(data_post);
            MongoClient.connect(uri, function(err, db) {
                if (err) throw err;
                var dbo = db.db("mywebsite_crud").collection("buku");
                dbo.insert(data_post, function(err, result){
                    if(err) throw err;
                    res.writeHead(302,{"Location" : "/buku"});
                    res.end();
                });
            });
        });

    }else{
        var html=view.compileFile('./templates/tambah.html')({
            title:"Tambah",
        });
        res.writeHead(200,{"Content-Type" : "text/html"});
        res.end(html);
    }

});

//edit
router.addRoute('/buku/edit/:id',function(req,res){
    _id=this.params.id;
    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
            var dbo = db.db("mywebsite_crud").collection("buku");
            dbo.findOne({"_id":ObjectId(_id)}, function(err, result) {

                if(req.method.toUpperCase()=='POST'){
                    var data_post="";
                    req.on('data',function(chuncks){
                        data_post += chuncks;
                    });
                     req.on('end',function(){
                        data_post =qString.parse(data_post);
                        dbo.update({"_id":ObjectId(_id)},{$set:data_post}, function(err, result){
                        if(err) throw err;
                        res.writeHead(302,{"Location" : "/buku"});
                        res.end();
                        });
                    });
                }
                else{
                    //solusi agar id tidak menjadi [object Object] pada view/parameter
                    var data_json=JSON.stringify(result) //untuk mengubah javascript array menjadi string JSON
                    var data_objt=JSON.parse(data_json) //untuk mengubah string JSON menjadi javascript object.
                
                    if (err) throw err;
                    var html=view.compileFile('./templates/edit.html')({
                        title:"Edit",
                        data : data_objt,
                    });
                    db.close();
                    
                    res.writeHead(200,{"Content-Type" : "text/html"});
                    res.end(html);
                }
            });
        
      });

});

//hapus
router.addRoute('/buku/delete/:id',function(req,res){
    _id=this.params.id;
    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
            var dbo = db.db("mywebsite_crud").collection("buku");
            dbo.remove({"_id":ObjectId(_id)}, function(err, result) {
                if(err) throw err;
                res.writeHead(302,{"Location" : "/buku"});
                res.end();
            });
    });
});
 
 //--------------------------------------End Route-------------------------------------------
 
 //---------------------------------------Server---------------------------------------------
 //membuat server
http.createServer(function(req,res){
    var path =url.parse(req.url).pathname;
    var match=router.match(path);
	//menampilkan request url
	console.log(req.method+' '+req.url);

    if(match){
        match.fn(req,res);
    }else{
        var html=view.compileFile('./templates/404.html')();
        res.writeHead(404,{"Content-Type" : "text/html"});
        res.end(html);
    }
  
}).listen(8000);
 
console.log('Server is running at port 8000');