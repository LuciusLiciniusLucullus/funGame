const canvas = document.getElementById('canvas1')
const ctx = canvas.getContext('2d')
canvas.width = 900;
canvas.height = 600;

//game grid global variables
const cellSize = 100;
const cellGap = 3;
let enemiesInterval = 600;
let resources = 300;
let frame = 0;
let gameOver = false;

const projectiles = [];
const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const idols = [];
//game board
const controlsBar = {
    width: canvas.width,
    height: cellSize
}

const mouse = {
    x: undefined,
    y: undefined,
    width: 0.1,
    height: 0.1
}

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function(evt){
    mouse.x = evt.x - canvasPosition.left;
    mouse.y = evt.y - canvasPosition.top;
})

canvas.addEventListener('mouseleave', function(){
    mouse.x = undefined;
    mouse.y = undefined;
})

//CLASSES
//cell class
class Cell{
    constructor(x, y){
        this.x = x
        this.y = y
        this.width = cellSize;
        this.height = cellSize;
    }

    draw(){
        if(mouse.x && mouse.y && collison(this, mouse)){
            ctx.strokeStyle = "black";
            ctx.strokeRect(this.x, this.y, this.width, this.height)
        }
        
    }
}

class Projectiles{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.damage = 20;
        this.speed = 5;
    }

    update(){
        this.x += this.speed;
    }

    draw(){
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
    }
}

//panettas
class Enemy{
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize;
        this.height = cellSize;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
    }

    update(){
        this.x -= this.movement;
    }

    draw(){
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "black";
        ctx.font = "20px Arial"
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y+30)
        ctx.fillStyle = "black";
        ctx.font = "15px Arial"
        ctx.fillText("Panetta Raider", this.x, this.y+50)
    }
}

//kpop army
class Defender{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
        this.shooting = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
    }

    draw(){
        ctx.fillStyle = "pink";
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.fillStyle = "black";
        ctx.font = "20px Arial"
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y+30)
        ctx.fillStyle = "black";
        ctx.font = "15px Arial"
        ctx.fillText("Test Infantry", this.x, this.y+50)
    }

    update(){
        this.timer++;
        if(this.timer % 100 === 0){
            projectiles.push(new Projectiles(this.x + 70, this.y + 50))
        }
    }
}

//place defender using mouse click
canvas.addEventListener('click', function(){
    const gridPositionX = mouse.x - (mouse.x % cellSize);
    const gridPositionY = mouse.y - (mouse.y % cellSize);

    if(gridPositionY < cellSize){
        return;
    }

    //prevent placing on the same block
    for(let i = 0; i < defenders.length; i++){
        if(defenders[i].x === gridPositionX && defenders[i].y === gridPositionY){
            return;
        }
    }
    let defenderCost = 100;
    if (resources >= defenderCost){
        //add defenders
        defenders.push(new Defender(gridPositionX, gridPositionY));
        //deduct resources for cost
        resources -= defenderCost;
        console.log("you have :" + resources)
    }else{
        console.log("out of resources")
    }
})


class Idol{
    constructor(name, hpBuff, atkBuff, resrBuff, desc){
        this.name = name;
        this.hpBuff = hpBuff;
        this.atkBuff = atkBuff;
        this.resrBuff = resrBuff;
        this.desc = desc;
    }
}

//FUNCTIONS
function handleDefenders(){
    for(let i = 0; i < defenders.length; i++){
        defenders[i].draw();
        defenders[i].update();
        for(let j = 0; j < enemies.length; j++){
            if(collison(defenders[i], enemies[i])){
                enemies[j].movement = 0;
                defenders[i].health -= 0.2;
            }
            if(defenders[i] && defenders[i].health <= 0){
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}

function handleEnemies(){
    for(let i = 0; i < enemies.length; i++){
        enemies[i].update();
        enemies[i].draw();
        if(enemies[i].x < 0){
            gameOver = true;
        }
    }
    //create new enemy after every frame
    if (frame % enemiesInterval === 0){
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
        enemies.push(new Enemy(verticalPosition))
        enemyPositions.push(verticalPosition)
    }
}

function handleProjectiles(){
    for(let i = 0; i < projectiles.length; i++){    
        projectiles[i].update();
        projectiles[i].draw();

        if(projectiles[i] && projectiles[i].x > canvas.width - cellSize){
            //remove projetile after it goes offscreen 
            projectiles.splice(i, 1);
            i--;
        }
    }
}
//init game board with cells objects
function createGrid(){
    for (let y = cellSize; y < canvas.height; y += cellSize){
        for(let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}

//fill game cells with colours
function handleGameGrid(){
    for(let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw()
    }
}


function handleGameStatus(){
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Gold: '+ resources, 20, 55)
    if (gameOver){
        ctx.fillStyle = 'black';
        ctx.font = '60px Arial';
        ctx.fillText('KPOP HAS LOST', 135, 330)
    }
}

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "blue";
    ctx.fillRect(0,0, controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleDefenders();
    handleProjectiles();
    handleEnemies();
    handleGameStatus();
    frame++;
    if(!gameOver){
        requestAnimationFrame(animate)
    }
        
}

function collison(firstObj, secondObj){
    if(!(firstObj.x > secondObj.x + secondObj.width || 
        firstObj.x + firstObj.width < secondObj.x ||
        firstObj.y > secondObj.y + secondObj.height ||
        firstObj.y + firstObj.height < secondObj.y
        )){
        return true;
    }
}

createGrid();
animate();

