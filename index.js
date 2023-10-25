const http=require('http');
const express=require('express');
const app=express();
const sqlite3=require('sqlite3').verbose();
const path=require('path');

app.use(express.static(__dirname+'/'));

app.set("view engine", "ejs"); 
app.set("views", path.join(__dirname, "")); 
app.use(express.urlencoded({extended:false})); 
app.listen(5000);
console.log("Servidor corriendo exitosamente en el puerto 5000")

const db_name = path.join(__dirname, "db", "productsdb.sqlite");
const db = new sqlite3.Database('db_name', (err) => {
    if (err){
        return console.error(err.message);
    } else{
        console.log("Conexión exitosa con la base de datos")
    }
})

const sql_create="CREATE TABLE IF NOT EXISTS Productos(Producto_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, Nombre VARCHAR(100) NOT NULL, Precio REAL NOT NULL, Descripcion TEXT);";

db.run(sql_create,err=>{
	if (err){
	return console.error(err.message);
}else{
	console.log("Tabla Productos anexada correctamente");
}
})

app.get('/',(req,res)=>{
	res.render('index.ejs')
})

app.get('/acerca',(req,res)=>{
	res.render('acerca.ejs')
})

app.get('/contacto',(req,res)=>{
	res.render('contacto.ejs')
})


app.get('/productos',(req,res)=>{
	const sql="SELECT * FROM Productos ORDER BY Nombre";
	db.all(sql, [],(err, rows)=>{
			if (err){
				return console.error(err.message);
			}else{
			res.render("Productos.ejs",{modelo:rows});
			}
	})
})

app.get('/crear',(req,res)=>{
	res.render('crear.ejs',{modelo: {}})
});

app.post('/crear',(req,res)=>{
	const sql = "INSERT INTO Productos(Nombre, Precio, Descripcion) VALUES(?,?,?)";
	const nuevo_producto = [req.body.Nombre, req.body.Precio, req.body.Descripcion];
	//const nuevo_producto=["Laptop",1200,"Ultima generación"];
	db.run(sql, nuevo_producto, err =>{
	if (err){
				return console.error(err.message);
			}
			else{
			res.redirect("/productos");
		}
	})
});

app.get("/editar/:id",(req, res)=>{
	const id=req.params.id;
	const sql="SELECT * FROM Productos WHERE Producto_ID=?";
	db.get(sql,id,(err, rows)=>{
		res.render("editar.ejs",{modelo: rows})
	})
})

app.post("/editar/:id",(req, res)=>{

	const id=req.params.id;
	const info_producto=[req.body.Nombre, req.body.Precio, req.body.Descripcion, id];
	const sql="UPDATE Productos SET Nombre=?, Precio=?, Descripcion=? WHERE (Producto_ID=?)";

	db.run(sql, info_producto, err =>{
			if (err){
				return console.error(err.message);
			}
			else{
					res.redirect("/productos");
		}
	});
})

app.get("/eliminar/:id",(req, res)=>{
	const id=req.params.id;
	const sql="SELECT * FROM Productos WHERE Producto_ID=?";
	db.get(sql,id,(err, rows)=>{
		res.render("eliminar.ejs",{modelo: rows})
	})
})

app.post("/eliminar/:id",(req, res)=>{

	const id=req.params.id;
	const sql="DELETE FROM Productos WHERE Producto_ID=?";

	db.run(sql, id, err =>{
			if (err){
				return console.error(err.message);
			}
			else{
					res.redirect("/productos");
		}
	});
})

app.get('/*',(req,res)=>{
	res.render('notfound.ejs')
})
