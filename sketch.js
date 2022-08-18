var catapult;
var backgroundImg;
var target;
var targetImg, catapultImg, canonBallImg, explode1Img, explode2Img, explode3Img;
var canonBall;
var ySpeed;
var loaded;
var explode1, explode2, explode3;
var explodeTimer;
var speedInput;
var angleInput;
var fireControl;
var score;
var targetReturnTimer; //bird death to new bird timer
var targetalive;
var angryBirdFlyingAnimation;
var gameState;
var isAttacking;    //tracks whether bird is attacking
var birdAttackCountDown;
var attackVelocity; //velocity with which the flying bird attacks
var attackTimeLowerBound;
var attackTimeUpperBound;
var birdBomb,birdBombImg;
var birdPoop,birdPoopImg;
var lowerDropRange;
var upperDropRange;
var dropPoint;
var birdBombVelocityY;
var bombsAway;
var gameTime;
// createGroup = canonBalls;

function preload(){
    backgroundImg = loadImage("assets/Background.jpg");
    catapultImg = loadImage("assets/Rocket_Artillery.webp");
    targetImg = loadImage("assets/Angry_Bird.png");
    canonBallImg = loadImage("assets/Canon_ball.png");
    explode1Img = loadImage("assets/Explosion-1.png");
    explode2Img = loadImage("assets/Explosion-2.png");
    explode3Img = loadImage("assets/Explosion-3.png");
    birdBombImg = loadImage ("assets/birdBomb.png");
    birdPoopImg = loadImage("assets/poo1.png");
    angryBirdFlyingAnimation = loadAnimation("assets/angryBirdFlying1.png","assets/angryBirdFlying2.png","assets/angryBirdFlying3.png");
}

function setup(){
    createCanvas(windowWidth, windowHeight);
    
    gameTime = 2000;
    bombsAway = false;
    birdBombVelocityY = 10;
    lowerDropRange = 0.2*windowWidth;
    upperDropRange = 0.9*windowWidth;
    dropPoint = windowWidth;
    attackVelocity = 3;
    attackTimeLowerBound = 300;
    attackTimeUpperBound = 1000;
    birdAttackCountDown = Math.round(random(attackTimeLowerBound,attackTimeUpperBound));
    isAttacking = false;
    gameState = 1;
    angleInput = 20;
    speedInput = 30;
    targetalive = true;
    targetReturnTimer = 0;
    score = 0;
    
    explodeTimer = 0;

    birdBomb = createSprite(100,100,30,30);
    birdBomb.addAnimation("birdBomb",birdBombImg);
    birdBomb.scale = 0.05;
    birdBomb.visible = false;

    birdPoop = createSprite(200,100,30,30);
    birdPoop.addAnimation("birdPoop",birdPoopImg);
    birdPoop.scale = 0.5;
    birdPoop.visible = false;

    angryBirdFlying = createSprite(10,10,200,200);
    angryBirdFlying.addAnimation("angryBirdFlying",angryBirdFlyingAnimation);
    angryBirdFlying.scale = 0.25;
    angryBirdFlying.visible = false;

    catapult = createSprite(windowWidth-200,windowHeight-300,100,50);
    catapult.addImage("catapult", catapultImg);
    catapult.scale = 0.125;

    target = createSprite(windowWidth-1500,windowHeight-300,100,50);
    target.addImage("target",targetImg);
    target.scale = 0.07;

    canonBall = createSprite(windowWidth-200,windowHeight-340,100,100);
    canonBall.addImage("canonBall",canonBallImg);
    canonBall.scale = 0.05;
    canonBall.visible = false;

    explode1 = createSprite(windowWidth-1500,windowHeight-300,100,50);
    explode1.addImage("explode1", explode1Img);
    explode1.scale = 0.3;
    explode1.visible = false;

    explode2 = createSprite(windowWidth-1500,windowHeight-300,100,50);
    explode2.addImage("explode2", explode2Img);
    explode2.scale = 0.8;
    explode2.visible = false;

    explode3 = createSprite(windowWidth-1500,windowHeight-300,100,50);
    explode3.addImage("explode3", explode3Img);
    explode3.scale = 0.5;
    explode3.visible = false;

    fireControl = createSprite(0.9*windowWidth,0.2*windowHeight,30,30);
    fireControl.shapeColor="green";
    

    loaded = 1
}

function draw(){
    background(backgroundImg);
    if (gameState == 1 || gameState == 2){
        resetTarget();
        VelocityInput();
        Fire();
        Destroy(target);
        fireControlColor();
        birdAttack();
        textSize(30);
        fill("black");
        textFont("algerian");
        text("Score: "+ score,0.1*windowWidth,0.1*windowHeight);
        Drive();
        advanceGame();
        birdBombAttack();
        speedUp();
    }
    gameOver();
    drawSprites();
}

function advanceGame(){
    if (score>10){
        gameState = 2;
    }
}

function resetTarget(){
    if (targetReturnTimer > 0){
        targetReturnTimer = targetReturnTimer - 1;
    }
    else if (targetalive == false) {
        targetalive = true;
        repositionTarget(2,target);
    }
}

function fireControlColor(){
    if (loaded == 0){
        fireControl.shapeColor="red";
    }
    else {
        fireControl.shapeColor="green";
    }
}

function repositionCanonBall(){
    canonBall.x=catapult.x;
    canonBall.y=catapult.y;
    canonBall.velocityX = 0;
    canonBall.velocityY = 0;
    loaded = 1;
}

function repositionTarget(p_positionTypeID, p_target){
    if (p_positionTypeID == 1){
        p_target.x = -50;
        p_target.y = 50;
    }
    else if (p_positionTypeID ==2){
        p_target.x = Math.round(random(0.1*windowWidth,0.5*windowWidth));
        p_target.y = Math.round(random(0.1*windowHeight,0.8*windowHeight));
    }
}

function Fire(){    

    if (keyDown("space") && loaded == 1) {
        loaded = 0;
        canonBall.visible = true;
        canonBall.velocityX = FN_Xvelocity(-angleInput, speedInput);
        canonBall.velocityY = FN_Yvelocity(angleInput, speedInput);
    }
    //if (canonBall.visible == true){
    if (loaded==0){    
        canonBall.velocityY = canonBall.velocityY + 0.5;
        if (canonBall.y>windowHeight){
            repositionCanonBall();
        }
    }
 
}

function Destroy(p_target){
    if (canonBall.isTouching(p_target)){
        explodeTimer = 50;
        // Make score increase by a certain amount depending on the target destroyed.
        score = score + 5;
        explode1.x = p_target.x;
        explode1.y = p_target.y;
        explode2.x = p_target.x;
        explode2.y = p_target.y;
        explode3.x = p_target.x;
        explode3.y = p_target.y;
        repositionCanonBall();
        repositionTarget(1,p_target);
        targetReturnTimer = 100;
        targetalive = false;
 
    
    }
    else if(explodeTimer>40){
            explode1.visible = true;
            explode2.visible = false;
            explode3.visible = false;
            explodeTimer = explodeTimer - 1;
    }  
    else if (explodeTimer>30) {
            explode1.visible = false;    
            explode2.visible = true;
            explode3.visible = false;
            explodeTimer = explodeTimer - 1;
    }
    else if (explodeTimer>0) {
        explode1.visible = false;
        explode2.visible = false;    
        explode3.visible = true;
        explodeTimer = explodeTimer - 1;
    }
    else {
        explode1.visible = false;
        explode2.visible = false;    
        explode3.visible = false;
    }
 }


function VelocityInput(){
    textSize(30);
    fill("black");
    textFont("algerian");
    text("Canon ball Angle: "+ angleInput,0.8*windowWidth,0.1*windowHeight);
    text("Canon ball Power: "+ speedInput,0.8*windowWidth,0.15*windowHeight);
    if (keyDown(UP_ARROW)){
        angleInput = angleInput + 1;
    }
    if (keyDown(DOWN_ARROW)){
        angleInput = angleInput - 1;
    }
    if (keyDown("W")){
        speedInput = speedInput + 1;
    }
    if (keyDown("S")){
        speedInput = speedInput - 1;
    }
}


function FN_Yvelocity(p_angleInput,p_power){
    return -p_power*Math.sin(p_angleInput/180*3.14159);
}

function FN_Xvelocity(p_angleInput, p_power){
    return -p_power*Math.cos(p_angleInput/180*3.14159)
}

function Drive(){
    if(keyDown(RIGHT_ARROW)){

        catapult.x = catapult.x + 3;
        if (loaded ==1){
            canonBall.x = catapult.x; 
        } 
        
    }
    if(keyDown(LEFT_ARROW)){
        catapult.x = catapult.x - 3;
        if (loaded == 1 ) {
            canonBall.x = catapult.x;
        }

    }
}

function birdAttack(){
    // text("birdAttackCountDown=" + birdAttackCountDown, 300, 300)
    // text("GameState=" + gameState, 300, 330);
    // text("Bird XYposition =(" + angryBirdFlying.x + "," + angryBirdFlying.y + ")",300,360);
    // text("Bird speed =" + angryBirdFlying.velocityX,300,390);
    // text ("isAttacking =" + isAttacking,300,420);
    // text ("drop point =" + dropPoint,300,450);
    // text ("game time =" + gameTime,300,480);
    textSize(20);
    text ("Press Up/Down Arrow to change angle.",100,300);
    text ("Press Left/Right Arrow to move Himar.",100,330);
    text ("Press W/S to change power.",100,360);
    text ("Press space bar to fire.",100,390);
    
    if (gameState ==2){

        if (birdAttackCountDown > 0 && isAttacking == false){
            birdAttackCountDown = birdAttackCountDown - 1;
        }
        if (catapult.x < windowWidth*0.5 && isAttacking == false){
            isAttacking = true;
            bombsAway = false;
            dropPoint = Math.round(random(lowerDropRange,upperDropRange));
            angryBirdFlying.visible = true;
            angryBirdFlying.x = 0
            angryBirdFlying.velocityX = attackVelocity;
        }
        if (birdAttackCountDown == 0 && isAttacking == false){
            isAttacking = true;
            bombsAway = false;
            dropPoint = Math.round(random(lowerDropRange,upperDropRange));
            angryBirdFlying.visible = true;
            angryBirdFlying.x = 0
            angryBirdFlying.velocityX = attackVelocity;
        }

        if (canonBall.isTouching(angryBirdFlying)){
            Destroy(angryBirdFlying);
            angryBirdFlying.x = -65;
            angryBirdFlying.velocityX = 0;
            isAttacking = false;
            birdAttackCountDown = Math.round(random(attackTimeLowerBound,attackTimeUpperBound));
         }
        else if (angryBirdFlying.x>windowWidth){
            angryBirdFlying.x = -65;
            angryBirdFlying.velocityX = 0;
            isAttacking = false;
            birdAttackCountDown = Math.round(random(attackTimeLowerBound,attackTimeUpperBound));
        }
    }
}

function birdBombAttack(){
    if (angryBirdFlying.x >= dropPoint && isAttacking == true && bombsAway == false){
        bombsAway = true;
        birdBomb.x = dropPoint;
        birdBomb.y = angryBirdFlying.y;
        birdBomb.visible = true;
        birdBomb.velocityY = birdBombVelocityY;
        v_errorRange = Math.round(random(-150,150));
        v_time = ((windowHeight -300) - birdBomb.y)/birdBombVelocityY;
        v_xSpeed = (catapult.x+v_errorRange-dropPoint)/v_time;
        birdBomb.velocityX = v_xSpeed;

    }

    if (birdBomb.isTouching(catapult)){
        birdPoop.x = catapult.x;
        birdPoop.y = catapult.y+30;
        birdBomb.destroy();
        birdPoop.visible = true;
        gameState = 99;
    }
}

function speedUp(){
    gameTime = gameTime -1;
    if(gameTime <= 0){
        gameTime = 1500;
        attackVelocity = attackVelocity + 2;
        birdBombVelocityY = birdBombVelocityY + 2;
        if (attackTimeLowerBound>=50){
            attackTimeLowerBound = attackTimeLowerBound - 50;
        }
        if (attackTimeUpperBound>100){
            attackTimeUpperBound = attackTimeUpperBound - 50;
        }
    }
}

function gameOver(){
    textFont("algerian");
    textSize(30);
    fill("black");
    text("Score: "+ score,0.1*windowWidth,0.1*windowHeight);
    if (gameState == 99){
        textSize(90);
        fill("red");
        textFont("algerian");
        text("Game Over",500,500);
        angryBirdFlying.velocityX = 0;
    }
}
