const express = require("express");
const app = express();

const fs = require("fs");
const util = require("util");

const write = util.promisify(fs.writeFile);
const read = util.promisify(fs.readFile);

let cars = [];
let cache = [];
const marcas =[];
try {
  read("./JSON/cars.json")
    .then((re) => (cars = JSON.parse(re.toString())))
    .catch((err) => {
      if (err.errno == "-4058") {
        write("./JSON/cars.json", JSON.stringify([]));
      } else {
        console.log(err);
      }
    });
} catch (error) {}


const reload_cache =()=>{
  try {
    read("./JSON/cache.json")
      .then((re) => {
          cache = JSON.parse(re.toString())
          cache.map( c => {
           if(marcas.indexOf(c.marca) == -1){
              marcas.push(c.marca)
           }
          })
      })
      .catch((err) => {
        if (err.errno == "-4058") {
          write("./JSON/cache.json", JSON.stringify([]));
        } else {
          console.log(err);
        }
      });
  } catch (error) {}
  
  
}
reload_cache()

app.use(express.json()); // Middleware para analizar el cuerpo de la solicitud JSON
// marcas.push(document.getElementById("inp").value)
// process_count()
let counter = 0;

app.get("/", (req, res) => {
    counter = cache.length;

  res.send(`
    <div>
      <h3 id="cosa">${cars[counter]}</h3>
      <br>
      <div id="ticket" style="display: inline-block; width: 80%">
    
</div>
<br>

<input id="inp" type="text"/>
<button id="send">SEND</button>

      <script>
      
document.getElementById("send").onclick =()=>{
    marcas.push(document.getElementById("inp").value)
    document.getElementById("inp").value = ""
    build_marcas()
}
      let count = ${counter};
      const marcas = ${JSON.stringify(marcas)};
      let carname = '${cars[counter]}';
      const build_marcas =()=>{
        const container = document.getElementById("ticket")
    container.textContent = "";
    
    marcas.map(m => {
        const button = document.createElement("button");
        button.textContent = m;
        button.style.margin = "1% 1%";
        button.onclick =()=>{
          let conf = false;

          if(!carname.includes(m)){
            if(window.confirm("")){
              conf = true;
            }
          }else{
             conf = true;
          }
          if(conf){
            fetch("/marcas/?marca=" + m + "&id=" + count + "&name=" + carname, {
              method: "post",
              headers: {
                "Content-Type": "application/json"
              },
            }).then(re => {
              process_count()
            }).catch(er => console.log(er));
          }
        }
        container.append(button)

    })
    }
    
    const process_count =()=> {
        count ++ 
        fetch("/car/" + count, {
            method: "post",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ cosa: "" }),
          }).then(re => {
            re.json().then(r => {
              carname = r.message;
                document.getElementById("cosa").textContent =r.message;
            })
            
          }).catch(er => console.log(er));
        
        
    }
    
    
    
    build_marcas()

      
        window.onkeydown = (e) => {


      
        }
      </script>
    </div>
  `);
});


const update =()=>{
    
}

app.post("/car/:id", (req, res) => {
  res.json({ message: cars[req.params.id] });
});
app.post("/marcas", async(req, res) => {

    cache.push({
        id : req.query.id,
        marca : req.query.marca,
        name : req.query.name,
    });
    await write("./JSON/cache.json", JSON.stringify(cache));
    reload_cache()
    res.json({  });
  });
  
app.listen(3000, () => {
  console.log("Servidor Express en funcionamiento en el puerto 3000");
});


