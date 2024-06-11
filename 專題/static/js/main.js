let mapArray, ctx, currentImgMain;
let imgMountain, imgMain, imgEnemy;
const gridLength = 100;
let aiStopped = false; // Flag to indicate if AI should stop
let Graph1 = document.getElementById('Graph1');
let Graph2 = document.getElementById('Graph2');
let Graph3 = document.getElementById('Graph3');
let Titanic_data = JSON.parse(document.getElementById('Titanic').innerHTML);

let trace1 = {};
trace1.type = "pie";
trace1.labels = ["Male", "Female"];
trace1.values = [0, 0];
Titanic_data.forEach(item => {
    trace1.values[0] += item.male;
    trace1.values[1] += item.female;
});

let data1 = [trace1];
let layout1 = { margin: { t: 10, l: 0 } };
Plotly.newPlot(Graph1, data1, layout1);

let trace2 = {};
trace2.type = "pie";
trace2.labels = [];
trace2.values = [];
Titanic_data.forEach(item => {
    trace2.labels.push(item.f); // Assuming 'f' is the name of the program
    trace2.values.push(item.male + item.female);
});

let data2 = [trace2];
let layout2 = { margin: { t: 10, l: 0 } };
Plotly.newPlot(Graph2, data2, layout2);

let trace3 = {};
trace3.type = "bar";
trace3.x = [];
trace3.y = [];
trace3.name = "Male";
trace3.marker = { color: 'blue' };
Titanic_data.forEach(item => {
    trace3.x.push(item.f); // Assuming 'f' is the name of the program
    trace3.y.push(item.male);
});

let trace4 = {};
trace4.type = "bar";
trace4.x = [];
trace4.y = [];
trace4.name = "Female";
trace4.marker = { color: 'pink' };
Titanic_data.forEach(item => {
    trace4.x.push(item.f); // Assuming 'f' is the name of the program
    trace4.y.push(item.female);
});

let data3 = [trace3, trace4];
let layout3 = { barmode: 'stack', margin: { t: 10, l: 0 } };
Plotly.newPlot(Graph3, data3, layout3);






// Initialize
$(function(){
    // 0 : Walkable, 1 : Mountain, 2 : Final Destination, 3 : Enemy
    mapArray = [
        [1,1,1,1,1,1,1,1,1,1],
        [1,7,1,1,6,1,1,5,1,1],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [1,2,1,1,3,1,1,4,1,1],
        [1,1,1,1,1,1,1,1,1,1],
    ];

    function loadImages(sources, callback) {
        var images = {};
        var loadedImages = 0;
        var numImages = 0;
        for(var src in sources) {
          numImages++;
        }
        for(var src in sources) {
          images[src] = new Image();
          images[src].onload = function() {
            if(++loadedImages >= numImages) {
              callback(images);
            }
          };
          images[src].src = sources[src];
        }
    }
    var canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');

    var sources = {
        people: '/static/images/people.png',
        darthVader: '/static/images/tree.png',
        yoda: '/static/images/people.png',
        ai: '/static/images/people.png',
    };

    currentImgMain = {
        x:900,
        y:500
    };

    let AIImgMain = {
        x:900,
        y:700
    };

    loadImages(sources, function(images) {
        ctx.drawImage(images.people,0,2,46,46,currentImgMain.x, currentImgMain.y, gridLength,gridLength);  
        ctx.drawImage(images.ai, 430, 5, 46, 46, AIImgMain.x, AIImgMain.y, gridLength, gridLength);
        imgMain = images.people;
        imgEnemy = images.ai;
        for(let x in mapArray){
            for(let y in mapArray[x]){
                if(mapArray[x][y] == 1){
                    let randomIndex = Math.floor(Math.random() * 4);
                    switch (randomIndex) {
                        case 0:
                            ctx.drawImage(images.darthVader, 0, 0, 120, 162, y*gridLength, x*gridLength, gridLength, gridLength);
                            break;
                        case 1:
                            ctx.drawImage(images.darthVader, 130, 0, 120, 170, y*gridLength, x*gridLength, gridLength, gridLength);
                            break;
                        case 2:
                            ctx.drawImage(images.darthVader, 0, 160, 120, 162, y*gridLength, x*gridLength, gridLength, gridLength);
                            break;
                        case 3:
                            ctx.drawImage(images.darthVader, 130, 160, 120, 162, y*gridLength, x*gridLength, gridLength, gridLength);
                            break;
                    }
                }else if(mapArray[x][y] == 2){
                    ctx.drawImage(images.yoda, 190, 2, 46, 46, y*gridLength, x*gridLength, gridLength, gridLength);
                }else if(mapArray[x][y] == 3){
                    ctx.drawImage(images.yoda, 336, 3, 46, 46, y*gridLength, x*gridLength, gridLength, gridLength);
                }else if(mapArray[x][y] == 4){
                    ctx.drawImage(images.yoda, 336, 193, 46, 46, y*gridLength, x*gridLength, gridLength, gridLength);
                }else if(mapArray[x][y] == 5){
                    ctx.drawImage(images.yoda, 430, 193, 46, 46, y*gridLength, x*gridLength, gridLength, gridLength);
                }else if(mapArray[x][y] == 6){
                    ctx.drawImage(images.yoda, 192, 193, 46, 46, y*gridLength, x*gridLength, gridLength, gridLength);
                }else if(mapArray[x][y] == 7){
                    ctx.drawImage(images.yoda, 0, 193, 46, 46, y*gridLength, x*gridLength, gridLength, gridLength);
                }
            }
        }
        // Start AI movement
        setInterval(moveAI, 500); // Move AI every 500ms
    });

    function moveAI() {
        if (aiStopped) return; // Check if AI should stop

        let cutX;
        let direction = Math.floor(Math.random() * 4); // Random direction: 0 = left, 1 = up, 2 = right, 3 = down
        let targetImg = { x: AIImgMain.x, y: AIImgMain.y };
        switch(direction) {
            case 0: targetImg.x -= gridLength ,  cutX = 50; break;
            case 1: targetImg.y -= gridLength , cutX = 146; break;
            case 2: targetImg.x += gridLength , cutX = 98; break;
            case 3: targetImg.y += gridLength , cutX = 2; break;
        }

        if(targetImg.x >= 0 && targetImg.x < 1000 && targetImg.y >= 0 && targetImg.y < 1000) {
            let targetBlock = { x: targetImg.y / gridLength, y: targetImg.x / gridLength };
            if(mapArray[targetBlock.x][targetBlock.y] === 0) {
                ctx.clearRect(AIImgMain.x, AIImgMain.y, gridLength, gridLength);
                AIImgMain.x = targetImg.x;
                AIImgMain.y = targetImg.y;
                ctx.drawImage(imgEnemy, 430, cutX, 46, 46, AIImgMain.x, AIImgMain.y, gridLength, gridLength);

                // Check for collision with the main character
                if (currentImgMain.x === AIImgMain.x && currentImgMain.y === AIImgMain.y) {
                    // Trigger AI's thought process
                    $("#talkBox").text("機器人思考中...");
                    $.post('/call_llm')
                        .done(function(data) {
                            console.log(data);
                            $("#talkBox").text(data);
                        });
                    aiStopped = true; // Stop AI movement
                }
            }
        }
    }

    $(document).on("keydown", function(event){
        let targetImg, targetBlock, cutImagePositionX;
        targetImg = {
            x:-1,
            y:-1
        };
        targetBlock = {
            x:-1,
            y:-1
        };
        event.preventDefault();
        switch(event.code){
            case "ArrowLeft":
                targetImg.x = currentImgMain.x - gridLength;
                targetImg.y = currentImgMain.y;
                cutImagePositionX = 50;
                aiStopped = false;
                break;
            case "ArrowUp":
                targetImg.x = currentImgMain.x;
                targetImg.y = currentImgMain.y - gridLength;
                cutImagePositionX = 146;
                aiStopped = false;
                break;
            case "ArrowRight":
                targetImg.x = currentImgMain.x + gridLength;
                targetImg.y = currentImgMain.y;
                cutImagePositionX = 98;
                aiStopped = false;
                break;
            case "ArrowDown":
                targetImg.x = currentImgMain.x;
                targetImg.y = currentImgMain.y + gridLength;
                cutImagePositionX = 2;
                aiStopped = false;
                break;
            default:
                return;
        }

        if(targetImg.x < 1000 && targetImg.x >=0 && targetImg.y < 1000 && targetImg.y >=0){
            targetBlock.x = targetImg.y / gridLength;
            targetBlock.y = targetImg.x / gridLength;
        }else{
            targetBlock.x = -1;
            targetBlock.y = -1;
        }

        ctx.clearRect(currentImgMain.x, currentImgMain.y, gridLength, gridLength);

        if(targetBlock.x != -1 && targetBlock.y != -1){
            switch(mapArray[targetBlock.x][targetBlock.y]){
                case 0:
                    $("#talkBox").text("");
                    currentImgMain.x = targetImg.x;
                    currentImgMain.y = targetImg.y;
                    break;
                case 1:
                    $("#talkBox").text("撞到樹拉  ( ╬ ☉д⊙)");
                    break;
                case 2:
                    var selectedCourses = courses[0];
                    var randomCourse = selectedCourses[Math.floor(Math.random() * selectedCourses.length)];
                    $("#talkBox").text(`自然科學領域の推薦課程：${randomCourse}`);
                    break;
                case 3: 
                    var selectedCourses = courses[1];
                    var randomCourse = selectedCourses[Math.floor(Math.random() * selectedCourses.length)];
                    $("#talkBox").text(`社會科學領域の推薦課程：${randomCourse}`);
                    break;
                case 4:
                    var selectedCourses = courses[2];
                    var randomCourse = selectedCourses[Math.floor(Math.random() * selectedCourses.length)];
                    $("#talkBox").text(`人文藝術領域の推薦課程：${randomCourse}`);
                    break;
                case 5:
                    var selectedCourses = courses[3];
                    var randomCourse = selectedCourses[Math.floor(Math.random() * selectedCourses.length)];
                    $("#talkBox").text(`生命科學領域の推薦課程：${randomCourse}`);
                    break;
                case 6:
                    var selectedCourses = courses[4];
                    var randomCourse = selectedCourses[Math.floor(Math.random() * selectedCourses.length)];
                    $("#talkBox").text(`通識跨域課程の推薦課程：${randomCourse}`);
                    break;
                case 7:
                    $("#talkBox").text("表格");
                    $("#popupDialog").css("display", "block"); // 將 #popupDialog 設置為顯示
                    //$("#Graph3").css("display", "block");
                    break;
            }
        }else{
            $("#talkBox").text("沒路走了 求背背(๑´ㅂ`๑)");
        }

        ctx.drawImage(imgMain, 0,cutImagePositionX,46,46, currentImgMain.x, currentImgMain.y, gridLength, gridLength);

        // Check for collision with AI character
        if (currentImgMain.x === AIImgMain.x && currentImgMain.y === AIImgMain.y) {
            $("#talkBox").text("機器人思考中...");
            $.post('/call_llm')
                .done(function(data) {
                    console.log(data);
                    $("#talkBox").text(data);
                });
            aiStopped = true; // Stop AI movement
        }
    });
});
