var col=['red','blue','black','green','pink','brown','purple'];
var i=0;
setInterval(animate,500);
function animate() {
    $("#span1").css("color", col[i]);
    i++;
    if (i == col.length) {
        i = 0;
    }
}

setInterval(topic,500);
function topic() {
    var width=$("body").width();
    var x=$("#span1").position().left;
    var b=1;
    if(b==1){
        for (x==0; x<= width; x = $("#span1").css("right", x + 10+ "px")) {
            if (x==width) {
                $("#span1").css("transform", "scale(1)");
                b = 0;
            }
        }
    }else if(b==0){
        for (x==width;x>=0;x= $("#span1").css("left",x - 10 + "px")){
            if(x==0) {
                $("#span1").css("transform", "scale(1)");
                b = 1;
            }

        }
    }
}


var whiteBoxes=['a8','c8','e8','g8','b7','d7','f7','h7','a6','c6','e6','g6','b5','d5','f5','h5','a4','c4','e4','g4','b3','d3','f3','h3','a2','c2','e2','g2','b1','d1','f1','h1'];

var blackBoxes=['b8','d8','f8','h8','a7','c7','e7','g7','b6','d6','f6','h6','a5','c5','e5','g5','b4','d4','f4','h4','a3','c3','e3','g3','b2','d2','f2','h2','a1','c1','e1','g1'];

var BlackTeam=['awr','bwn','cwb','dwk','ewq','fwb','gwn','hwr','awp','bwp','cwp','dwp','ewp','fwp','gwp','hwp'];

var whiteTeam=['abr','bbn','cbb','dbq','ebk','fbb','gbn','hbr','abp','bbp','cbp','dbp','ebp','fbp','gbp','hbp'];


var col=['a','b','c','d','e','f','g','h'];
var row=[1,2,3,4,5,6,7,8];
var pawnStack=[1,2,3,4,5,6,7,8,9,0];

function refreshBoxes() {
    for(var i=0;i<col.length;i++){
        for(var j=0;j<row.length;j++){
            for(var k=0;k<whiteBoxes.length;k++){
                if(col[i]+row[j] === whiteBoxes[k]){
                    $("#"+col[i]+row[j]).removeClass('TrapBox');
                    $("#"+col[i]+row[j]).removeClass('selectedBox');
                    $("#"+col[i]+row[j]).addClass('r01');
                    $("#"+col[i]+row[j]).attr('ondrop','');
                    $("#"+col[i]+row[j]).attr('ondragover','');
                }
            }
            for(var k=0;k<blackBoxes;k++){
                if(col[i]+row[j] === blackBoxes[k]){
                    $("#"+col[i]+row[j]).removeClass('TrapBox');
                    $("#"+col[i]+row[j]).removeClass('selectedBox');
                    $("#"+col[i]+row[j]).addClass('r01');
                    $("#"+col[i]+row[j]).attr('ondrop','');
                    $("#"+col[i]+row[j]).attr('ondragover','');
                }
            }
        }
    }
}
function allowDrop(ev,e) {
    if($("#"+e.id).find("img").length > 0){
        $("#"+e.id).children("img").remove();
    }
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev,e) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
    refreshBoxes();
}

function clickPawn(e) {
    refreshBoxes();
    var parentId=e.parentNode.id;
    for(var i=0;i<col.length;i++){
        for(var j=0;j<row.length;j++){
            if(parentId === col[i]+row[j]){
                var path=(col[i])+row[j-1];
                var pathId="#"+path;
                $(pathId).addClass('selectedBox');
                $(pathId).attr('ondrop','drop(event,this)');
                $(pathId).attr('ondragover','allowDrop(event,this)');

            }
        }
    }
}
function clickRedPawn(e) {
    refreshBoxes();
    var parentId=e.parentNode.id;
    for(var i=0;i<col.length;i++){
        for(var j=0;j<row.length;j++){
            if(parentId === col[i]+row[j]){
                var path=(col[i])+row[j+1];
                var pathId="#"+path;
                $(pathId).addClass('selectedBox');
                $(pathId).attr('ondrop','drop(event,this)');
                $(pathId).attr('ondragover','allowDrop(event,this)');

            }
        }
    }
}
function clickBlackRook(e) {
    refreshBoxes();
    var parentId = e.parentNode.id;
    for (var i = 0; i < col.length; i++) {
        for (var j = 0; j < row.length; j++) {
            if(parentId === col[i]+row[j]){
                for(var k=1;k<=8;k++){
                    if($("#"+col[i]+row[j-k]).find("img").length > 0){
                        var chil=$("#"+col[i]+row[j-k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i]+row[j-k]).addClass('TrapBox');
                                $("#"+col[i]+row[j-k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i]+row[j-k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i]+row[j-k]).addClass('selectedBox');
                    $("#"+col[i]+row[j-k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i]+row[j-k]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){
                    if($("#"+col[i+k]+row[j]).find("img").length > 0){
                        var chil=$("#"+col[i+k]+row[j]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i+k]+row[j]).addClass('TrapBox');
                                $("#"+col[i+k]+row[j]).attr('ondrop','drop(event,this)');
                                $("#"+col[i+k]+row[j]).attr('ondragover','allowDrop(event,this)');
                            }
                        }

                        break;
                    }
                    $("#"+col[i+k]+row[j]).addClass('selectedBox');
                    $("#"+col[i+k]+row[j]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+k]+row[j]).attr('ondragover','allowDrop(event,this)');

                }

                for(var k=1;k<=8;k++){
                    if($("#"+col[i-k]+row[j]).find("img").length > 0){
                        var chil=$("#"+col[i-k]+row[j]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i-k]+row[j]).addClass('TrapBox');
                                $("#"+col[i-k]+row[j]).attr('ondrop','drop(event,this)');
                                $("#"+col[i-k]+row[j]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i-k]+row[j]).addClass('selectedBox');
                    $("#"+col[i-k]+row[j]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-k]+row[j]).attr('ondragover','allowDrop(event,this)');

                }


                for(var k=1;k<=8;k++){
                    if($("#"+col[i]+row[j+k]).find("img").length > 0){
                        var chil=$("#"+col[i]+row[j+k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i]+row[j+k]).addClass('TrapBox');
                                $("#"+col[i]+row[j+k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i]+row[j+k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i]+row[j+k]).addClass('selectedBox');
                    $("#"+col[i]+row[j+k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i]+row[j+k]).attr('ondragover','allowDrop(event,this)');

                }
                return;
            }
        }

    }
}
function clickRedRook(e) {
    refreshBoxes();
    var parentId = e.parentNode.id;
    for (var i = 0; i < col.length; i++) {
        for (var j = 0; j < row.length; j++) {
            if(parentId === col[i]+row[j]){
                for(var k=1;k<=8;k++){
                    if($("#"+col[i]+row[j-k]).find("img").length > 0){
                        var chil=$("#"+col[i]+row[j-k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i]+row[j-k]).addClass('TrapBox');
                                $("#"+col[i]+row[j-k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i]+row[j-k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i]+row[j-k]).addClass('selectedBox');
                    $("#"+col[i]+row[j-k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i]+row[j-k]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){
                    if($("#"+col[i+k]+row[j]).find("img").length > 0){
                        var chil=$("#"+col[i+k]+row[j]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i+k]+row[j]).addClass('TrapBox');
                                $("#"+col[i+k]+row[j]).attr('ondrop','drop(event,this)');
                                $("#"+col[i+k]+row[j]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }

                        break;
                    }
                    $("#"+col[i+k]+row[j]).addClass('selectedBox');
                    $("#"+col[i+k]+row[j]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+k]+row[j]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){
                    if($("#"+col[i-k]+row[j]).find("img").length > 0){
                        var chil=$("#"+col[i-k]+row[j]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i-k]+row[j]).addClass('TrapBox');
                                $("#"+col[i-k]+row[j]).attr('ondrop','drop(event,this)');
                                $("#"+col[i-k]+row[j]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i-k]+row[j]).addClass('selectedBox');
                    $("#"+col[i-k]+row[j]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-k]+row[j]).attr('ondragover','allowDrop(event,this)');

                }

                for(var k=1;k<=8;k++){
                    if($("#"+col[i]+row[j+k]).find("img").length > 0){
                        var chil=$("#"+col[i]+row[j+k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i]+row[j+k]).addClass('TrapBox');
                                $("#"+col[i]+row[j+k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i]+row[j+k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i]+row[j+k]).addClass('selectedBox');
                    $("#"+col[i]+row[j+k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i]+row[j+k]).attr('ondragover','allowDrop(event,this)');

                }
                return;
            }
        }

    }
}
function clickBlackBishop(e) {
    refreshBoxes();
    var parentId=e.parentNode.id;
    for(var i=0;i<col.length;i++){
        for(var j=0;j<row.length;j++){
            if(parentId === col[i]+row[j]){
                for(var k=1;k<=8;k++){
                    if($("#"+col[i+k]+row[j+k]).find("img").length > 0){
                        var chil=$("#"+col[i+k]+row[j+k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i+k]+row[j+k]).addClass('TrapBox');
                                $("#"+col[i+k]+row[j+k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i+k]+row[j+k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i+k]+row[j+k]).addClass('selectedBox');
                    $("#"+col[i+k]+row[j+k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+k]+row[j+k]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){

                    if($("#"+col[i-k]+row[j-k]).find("img").length > 0){
                        var chil=$("#"+col[i-k]+row[j-k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i-k]+row[j-k]).addClass('TrapBox');
                                $("#"+col[i-k]+row[j-k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i-k]+row[j-k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i-k]+row[j-k]).addClass('selectedBox');
                    $("#"+col[i-k]+row[j-k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-k]+row[j-k]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){

                    if($("#"+col[i+k]+row[j-k]).find("img").length > 0){
                        var chil=$("#"+col[i+k]+row[j-k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i+k]+row[j-k]).addClass('TrapBox');
                                $("#"+col[i+k]+row[j-k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i+k]+row[j-k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i+k]+row[j-k]).addClass('selectedBox');
                    $("#"+col[i+k]+row[j-k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+k]+row[j-k]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){
                    if($("#"+col[i-k]+row[j+k]).find("img").length > 0){
                        var chil=$("#"+col[i-k]+row[j+k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i-k]+row[j+k]).addClass('TrapBox');
                                $("#"+col[i-k]+row[j+k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i-k]+row[j+k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i-k]+row[j+k]).addClass('selectedBox');
                    $("#"+col[i-k]+row[j+k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-k]+row[j+k]).attr('ondragover','allowDrop(event,this)');

                }
            }
        }
    }
}
function clickRedBishop(e) {
    refreshBoxes();
    var parentId=e.parentNode.id;
    for(var i=0;i<col.length;i++){
        for(var j=0;j<row.length;j++){
            if(parentId === col[i]+row[j]){
                for(var k=1;k<=8;k++){
                    if($("#"+col[i+k]+row[j+k]).find("img").length > 0){
                        var chil=$("#"+col[i+k]+row[j+k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i+k]+row[j+k]).addClass('TrapBox');
                                $("#"+col[i+k]+row[j+k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i+k]+row[j+k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i+k]+row[j+k]).addClass('selectedBox');
                    $("#"+col[i+k]+row[j+k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+k]+row[j+k]).attr('ondragover','allowDrop(event,this)');

                }
                //Left Bottom
                for(var k=1;k<=8;k++){

                    if($("#"+col[i-k]+row[j-k]).find("img").length > 0){
                        var chil=$("#"+col[i-k]+row[j-k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i-k]+row[j-k]).addClass('TrapBox');
                                $("#"+col[i-k]+row[j-k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i-k]+row[j-k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i-k]+row[j-k]).addClass('selectedBox');
                    $("#"+col[i-k]+row[j-k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-k]+row[j-k]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){

                    if($("#"+col[i+k]+row[j-k]).find("img").length > 0){
                        var chil=$("#"+col[i+k]+row[j-k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i+k]+row[j-k]).addClass('TrapBox');
                                $("#"+col[i+k]+row[j-k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i+k]+row[j-k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i+k]+row[j-k]).addClass('selectedBox');
                    $("#"+col[i+k]+row[j-k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+k]+row[j-k]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){
                    if($("#"+col[i-k]+row[j+k]).find("img").length > 0){
                        var chil=$("#"+col[i-k]+row[j+k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i-k]+row[j+k]).addClass('TrapBox');
                                $("#"+col[i-k]+row[j+k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i-k]+row[j+k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i-k]+row[j+k]).addClass('selectedBox');
                    $("#"+col[i-k]+row[j+k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-k]+row[j+k]).attr('ondragover','allowDrop(event,this)');

                }
            }
        }
    }
}
function clickRedKnight(e) {
    refreshBoxes();
    var parentId=e.parentNode.id;
    for(var i=0;i<col.length;i++){
        for(var j=0;j<row.length;j++){
            if(parentId === col[i]+row[j]){

                if($("#"+col[i+2]+row[j+1]).find("img").length > 0){
                    var chil=$("#"+col[i+2]+row[j+1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            $("#"+col[i+2]+row[j+1]).addClass('TrapBox');
                            $("#"+col[i+2]+row[j+1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+2]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            break;
                        }
                    }

                }else{
                    $("#"+col[i+2]+row[j+1]).addClass('selectedBox');
                    $("#"+col[i+2]+row[j+1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+2]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i+1]+row[j+2]).find("img").length > 0){
                    var chil=$("#"+col[i+1]+row[j+2]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            $("#"+col[i+1]+row[j+2]).addClass('TrapBox');
                            $("#"+col[i+1]+row[j+2]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+1]+row[j+2]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            break;
                        }
                    }

                }else{
                    $("#"+col[i+1]+row[j+2]).addClass('selectedBox');
                    $("#"+col[i+1]+row[j+2]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+1]+row[j+2]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i+2]+row[j-1]).find("img").length > 0){
                    var chil=$("#"+col[i+2]+row[j-1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            $("#"+col[i+2]+row[j-1]).addClass('TrapBox');
                            $("#"+col[i+2]+row[j-1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+2]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            break;
                        }
                    }

                }else{
                    $("#"+col[i+2]+row[j-1]).addClass('selectedBox');
                    $("#"+col[i+2]+row[j-1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+2]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                }


                if($("#"+col[i+1]+row[j-2]).find("img").length > 0){
                    var chil=$("#"+col[i+1]+row[j-2]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            $("#"+col[i+1]+row[j-2]).addClass('TrapBox');
                            $("#"+col[i+1]+row[j-2]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+1]+row[j-2]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            break;
                        }
                    }

                }else{
                    $("#"+col[i+1]+row[j-2]).addClass('selectedBox');
                    $("#"+col[i+1]+row[j-2]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+1]+row[j-2]).attr('ondragover','allowDrop(event,this)');
                }


                if($("#"+col[i-2]+row[j+1]).find("img").length > 0){
                    var chil=$("#"+col[i-2]+row[j+1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            $("#"+col[i-2]+row[j+1]).addClass('TrapBox');
                            $("#"+col[i-2]+row[j+1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-2]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            break;
                        }
                    }

                }else{

                    $("#"+col[i-2]+row[j+1]).addClass('selectedBox');
                    $("#"+col[i-2]+row[j+1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-2]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i-1]+row[j+2]).find("img").length > 0){
                    var chil=$("#"+col[i-1]+row[j+2]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            $("#"+col[i-1]+row[j+2]).addClass('TrapBox');
                            $("#"+col[i-1]+row[j+2]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-1]+row[j+2]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            break;
                        }
                    }

                }else{
                    $("#"+col[i-1]+row[j+2]).addClass('selectedBox');
                    $("#"+col[i-1]+row[j+2]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-1]+row[j+2]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i-2]+row[j-1]).find("img").length > 0){
                    var chil=$("#"+col[i-2]+row[j-1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            $("#"+col[i-2]+row[j-1]).addClass('TrapBox');
                            $("#"+col[i-2]+row[j-1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-2]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            break;
                        }
                    }

                }else{
                    //left Top
                    $("#"+col[i-2]+row[j-1]).addClass('selectedBox');
                    $("#"+col[i-2]+row[j-1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-2]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                }



                if($("#"+col[i-1]+row[j-2]).find("img").length > 0){
                    var chil=$("#"+col[i-1]+row[j-2]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            $("#"+col[i-1]+row[j-2]).addClass('TrapBox');
                            $("#"+col[i-1]+row[j-2]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-1]+row[j-2]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            break;
                        }
                    }

                }else{
                    $("#"+col[i-1]+row[j-2]).addClass('selectedBox');
                    $("#"+col[i-1]+row[j-2]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-1]+row[j-2]).attr('ondragover','allowDrop(event,this)');
                }


            }
        }
    }
}
function clickBlackKnight(e) {
    refreshBoxes();
    var parentId=e.parentNode.id;
    for(var i=0;i<col.length;i++){
        for(var j=0;j<row.length;j++){
            if(parentId === col[i]+row[j]){

                if($("#"+col[i+2]+row[j+1]).find("img").length > 0){
                    var chil=$("#"+col[i+2]+row[j+1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i+2]+row[j+1]).addClass('TrapBox');
                            $("#"+col[i+2]+row[j+1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+2]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    $("#"+col[i+2]+row[j+1]).addClass('selectedBox');
                    $("#"+col[i+2]+row[j+1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+2]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i+1]+row[j+2]).find("img").length > 0){
                    var chil=$("#"+col[i+1]+row[j+2]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i+1]+row[j+2]).addClass('TrapBox');
                            $("#"+col[i+1]+row[j+2]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+1]+row[j+2]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    $("#"+col[i+1]+row[j+2]).addClass('selectedBox');
                    $("#"+col[i+1]+row[j+2]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+1]+row[j+2]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i+2]+row[j-1]).find("img").length > 0){
                    var chil=$("#"+col[i+2]+row[j-1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i+2]+row[j-1]).addClass('TrapBox');
                            $("#"+col[i+2]+row[j-1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+2]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    $("#"+col[i+2]+row[j-1]).addClass('selectedBox');
                    $("#"+col[i+2]+row[j-1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+2]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                }


                if($("#"+col[i+1]+row[j-2]).find("img").length > 0){
                    var chil=$("#"+col[i+1]+row[j-2]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i+1]+row[j-2]).addClass('TrapBox');
                            $("#"+col[i+1]+row[j-2]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+1]+row[j-2]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    $("#"+col[i+1]+row[j-2]).addClass('selectedBox');
                    $("#"+col[i+1]+row[j-2]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+1]+row[j-2]).attr('ondragover','allowDrop(event,this)');
                }


                if($("#"+col[i-2]+row[j+1]).find("img").length > 0){
                    var chil=$("#"+col[i-2]+row[j+1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i-2]+row[j+1]).addClass('TrapBox');
                            $("#"+col[i-2]+row[j+1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-2]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    $("#"+col[i-2]+row[j+1]).addClass('selectedBox');
                    $("#"+col[i-2]+row[j+1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-2]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i-1]+row[j+2]).find("img").length > 0){
                    var chil=$("#"+col[i-1]+row[j+2]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i-1]+row[j+2]).addClass('TrapBox');
                            $("#"+col[i-1]+row[j+2]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-1]+row[j+2]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    $("#"+col[i-1]+row[j+2]).addClass('selectedBox');
                    $("#"+col[i-1]+row[j+2]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-1]+row[j+2]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i-2]+row[j-1]).find("img").length > 0){
                    var chil=$("#"+col[i-2]+row[j-1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){

                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            $("#"+col[i-2]+row[j-1]).addClass('TrapBox');
                            $("#"+col[i-2]+row[j-1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-2]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    $("#"+col[i-2]+row[j-1]).addClass('selectedBox');
                    $("#"+col[i-2]+row[j-1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-2]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                }



                if($("#"+col[i-1]+row[j-2]).find("img").length > 0){
                    var chil=$("#"+col[i-1]+row[j-2]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i-1]+row[j-2]).addClass('TrapBox');
                            $("#"+col[i-1]+row[j-2]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-1]+row[j-2]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    $("#"+col[i-1]+row[j-2]).addClass('selectedBox');
                    $("#"+col[i-1]+row[j-2]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-1]+row[j-2]).attr('ondragover','allowDrop(event,this)');
                }


            }
        }
    }
}
function clickBlackKing(e) {
    refreshBoxes();
    var parentId=e.parentNode.id;
    for(var i=0;i<col.length;i++){
        for(var j=0;j<row.length;j++){
            if(parentId === col[i]+row[j]){

                if($("#"+col[i]+row[j+1]).find("img").length > 0){
                    var chil=$("#"+col[i]+row[j+1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i]+row[j+1]).addClass('TrapBox');
                            $("#"+col[i]+row[j+1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    //top
                    $("#"+col[i]+row[j+1]).addClass('selectedBox');
                    $("#"+col[i]+row[j+1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i+1]+row[j+1]).find("whiteTeamimg").length > 0){
                    var chil=$("#"+col[i+1]+row[j+1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i+1]+row[j+1]).addClass('TrapBox');
                            $("#"+col[i+1]+row[j+1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+1]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    $("#"+col[i+1]+row[j+1]).addClass('selectedBox');
                    $("#"+col[i+1]+row[j+1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+1]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i-1]+row[j+1]).find("img").length > 0){
                    var chil=$("#"+col[i-1]+row[j+1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i-1]+row[j+1]).addClass('TrapBox');
                            $("#"+col[i-1]+row[j+1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-1]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    $("#"+col[i-1]+row[j+1]).addClass('selectedBox');
                    $("#"+col[i-1]+row[j+1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-1]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i]+row[j-1]).find("img").length > 0){
                    var chil=$("#"+col[i]+row[j-1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i]+row[j-1]).addClass('TrapBox');
                            $("#"+col[i]+row[j-1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    //bottom
                    $("#"+col[i]+row[j-1]).addClass('selectedBox');
                    $("#"+col[i]+row[j-1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i+1]+row[j-1]).find("img").length > 0){
                    var chil=$("#"+col[i+1]+row[j-1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i+1]+row[j-1]).addClass('TrapBox');
                            $("#"+col[i+1]+row[j-1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+1]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    $("#"+col[i+1]+row[j-1]).addClass('selectedBox');
                    $("#"+col[i+1]+row[j-1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+1]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i-1]+row[j-1]).find("img").length > 0){
                    var chil=$("#"+col[i-1]+row[j-1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i-1]+row[j-1]).addClass('TrapBox');
                            $("#"+col[i-1]+row[j-1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-1]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    $("#"+col[i-1]+row[j-1]).addClass('selectedBox');
                    $("#"+col[i-1]+row[j-1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-1]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                }


                if($("#"+col[i-1]+row[j]).find("img").length > 0){
                    var chil=$("#"+col[i-1]+row[j]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i-1]+row[j]).addClass('TrapBox');
                            $("#"+col[i-1]+row[j]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-1]+row[j]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    //right
                    $("#"+col[i-1]+row[j]).addClass('selectedBox');
                    $("#"+col[i-1]+row[j]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-1]+row[j]).attr('ondragover','allowDrop(event,this)');
                }


                if($("#"+col[i+1]+row[j]).find("img").length > 0){
                    var chil=$("#"+col[i+1]+row[j]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            break;
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            $("#"+col[i+1]+row[j]).addClass('TrapBox');
                            $("#"+col[i+1]+row[j]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+1]+row[j]).attr('ondragover','allowDrop(event,this)');
                        }
                    }

                }else{
                    //Left
                    $("#"+col[i+1]+row[j]).addClass('selectedBox');
                    $("#"+col[i+1]+row[j]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+1]+row[j]).attr('ondragover','allowDrop(event,this)');
                }


            }
        }
    }
}
function clickRedKing(e) {
    refreshBoxes();
    var parentId=e.parentNode.id;
    for(var i=0;i<col.length;i++){
        for(var j=0;j<row.length;j++){
            if(parentId === col[i]+row[j]){

                if($("#"+col[i]+row[j+1]).find("img").length > 0){
                    var chil=$("#"+col[i]+row[j+1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            $("#"+col[i]+row[j+1]).addClass('TrapBox');
                            $("#"+col[i]+row[j+1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            break;
                        }
                    }

                }else{
                    $("#"+col[i]+row[j+1]).addClass('selectedBox');
                    $("#"+col[i]+row[j+1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i+1]+row[j+1]).find("img").length > 0){
                    var chil=$("#"+col[i+1]+row[j+1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            $("#"+col[i+1]+row[j+1]).addClass('TrapBox');
                            $("#"+col[i+1]+row[j+1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+1]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            break;
                        }
                    }

                }else{
                    $("#"+col[i+1]+row[j+1]).addClass('selectedBox');
                    $("#"+col[i+1]+row[j+1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+1]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i-1]+row[j+1]).find("img").length > 0){
                    var chil=$("#"+col[i-1]+row[j+1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            $("#"+col[i-1]+row[j+1]).addClass('TrapBox');
                            $("#"+col[i-1]+row[j+1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-1]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            break;
                        }
                    }

                }else{
                    $("#"+col[i-1]+row[j+1]).addClass('selectedBox');
                    $("#"+col[i-1]+row[j+1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-1]+row[j+1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i]+row[j-1]).find("img").length > 0){
                    var chil=$("#"+col[i]+row[j-1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){
                            $("#"+col[i]+row[j-1]).addClass('TrapBox');
                            $("#"+col[i]+row[j-1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            break;

                        }
                    }

                }else{
                    $("#"+col[i]+row[j-1]).addClass('selectedBox');
                    $("#"+col[i]+row[j-1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i+1]+row[j-1]).find("img").length > 0){
                    var chil=$("#"+col[i+1]+row[j-1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){

                            $("#"+col[i+1]+row[j-1]).addClass('TrapBox');
                            $("#"+col[i+1]+row[j-1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+1]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            break;

                        }
                    }

                }else{
                    $("#"+col[i+1]+row[j-1]).addClass('selectedBox');
                    $("#"+col[i+1]+row[j-1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+1]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                }

                if($("#"+col[i-1]+row[j-1]).find("img").length > 0){
                    var chil=$("#"+col[i-1]+row[j-1]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){

                            $("#"+col[i-1]+row[j-1]).addClass('TrapBox');
                            $("#"+col[i-1]+row[j-1]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-1]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            break;

                        }
                    }

                }else{
                    $("#"+col[i-1]+row[j-1]).addClass('selectedBox');
                    $("#"+col[i-1]+row[j-1]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-1]+row[j-1]).attr('ondragover','allowDrop(event,this)');
                }


                if($("#"+col[i-1]+row[j]).find("img").length > 0){
                    var chil=$("#"+col[i-1]+row[j]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){

                            $("#"+col[i-1]+row[j]).addClass('TrapBox');
                            $("#"+col[i-1]+row[j]).attr('ondrop','drop(event,this)');
                            $("#"+col[i-1]+row[j]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){
                            break;

                        }
                    }

                }else{
                    $("#"+col[i-1]+row[j]).addClass('selectedBox');
                    $("#"+col[i-1]+row[j]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-1]+row[j]).attr('ondragover','allowDrop(event,this)');
                }


                if($("#"+col[i+1]+row[j]).find("img").length > 0){
                    var chil=$("#"+col[i+1]+row[j]).children("img");
                    for(var b=0;b<whiteTeam.length;b++){
                        if($(chil).attr('id')===whiteTeam[b]){

                            $("#"+col[i+1]+row[j]).addClass('TrapBox');
                            $("#"+col[i+1]+row[j]).attr('ondrop','drop(event,this)');
                            $("#"+col[i+1]+row[j]).attr('ondragover','allowDrop(event,this)');
                        }
                    }
                    for(var r=0;r<BlackTeam.length;r++){
                        if($(chil).attr('id')===BlackTeam[r]){

                            break;
                        }
                    }

                }else{
                    $("#"+col[i+1]+row[j]).addClass('selectedBox');
                    $("#"+col[i+1]+row[j]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+1]+row[j]).attr('ondragover','allowDrop(event,this)');
                }


            }
        }
    }
}
function clickBlackQueen(e) {
    refreshBoxes();
    var parentId=e.parentNode.id;
    for(var i=0;i<col.length;i++){
        for(var j=0;j<row.length;j++){
            if(parentId === col[i]+row[j]){
                for(var k=1;k<=8;k++){
                    if($("#"+col[i]+row[j-k]).find("img").length > 0){
                        var chil=$("#"+col[i]+row[j-k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i]+row[j-k]).addClass('TrapBox');
                                $("#"+col[i]+row[j-k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i]+row[j-k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i]+row[j-k]).addClass('selectedBox');
                    $("#"+col[i]+row[j-k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i]+row[j-k]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){
                    if($("#"+col[i+k]+row[j]).find("img").length > 0){
                        var chil=$("#"+col[i+k]+row[j]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i+k]+row[j]).addClass('TrapBox');
                                $("#"+col[i+k]+row[j]).attr('ondrop','drop(event,this)');
                                $("#"+col[i+k]+row[j]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i+k]+row[j]).addClass('selectedBox');
                    $("#"+col[i+k]+row[j]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+k]+row[j]).attr('ondragover','allowDrop(event,this)');

                }
                //left selecter
                for(var k=1;k<=8;k++){
                    if($("#"+col[i-k]+row[j]).find("img").length > 0){
                        var chil=$("#"+col[i-k]+row[j]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i-k]+row[j]).addClass('TrapBox');
                                $("#"+col[i-k]+row[j]).attr('ondrop','drop(event,this)');
                                $("#"+col[i-k]+row[j]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i-k]+row[j]).addClass('selectedBox');
                    $("#"+col[i-k]+row[j]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-k]+row[j]).attr('ondragover','allowDrop(event,this)');

                }
                //top selecter

                for(var k=1;k<=8;k++){
                    if($("#"+col[i]+row[j+k]).find("img").length > 0){
                        var chil=$("#"+col[i]+row[j+k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i]+row[j+k]).addClass('TrapBox');
                                $("#"+col[i]+row[j+k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i]+row[j+k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i]+row[j+k]).addClass('selectedBox');
                    $("#"+col[i]+row[j+k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i]+row[j+k]).attr('ondragover','allowDrop(event,this)');

                }
                //Right Top
                for(var k=1;k<=8;k++){
                    if($("#"+col[i+k]+row[j+k]).find("img").length > 0){
                        var chil=$("#"+col[i+k]+row[j+k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i+k]+row[j+k]).addClass('TrapBox');
                                $("#"+col[i+k]+row[j+k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i+k]+row[j+k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i+k]+row[j+k]).addClass('selectedBox');
                    $("#"+col[i+k]+row[j+k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+k]+row[j+k]).attr('ondragover','allowDrop(event,this)');

                }
                //Left Bottom
                for(var k=1;k<=8;k++){
                    if($("#"+col[i-k]+row[j-k]).find("img").length > 0){
                        var chil=$("#"+col[i-k]+row[j-k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i-k]+row[j-k]).addClass('TrapBox');
                                $("#"+col[i-k]+row[j-k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i-k]+row[j-k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i-k]+row[j-k]).addClass('selectedBox');
                    $("#"+col[i-k]+row[j-k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-k]+row[j-k]).attr('ondragover','allowDrop(event,this)');

                }
                //Right Bottom
                for(var k=1;k<=8;k++){
                    if($("#"+col[i+k]+row[j-k]).find("img").length > 0){
                        var chil=$("#"+col[i+k]+row[j-k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i+k]+row[j-k]).addClass('TrapBox');
                                $("#"+col[i+k]+row[j-k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i+k]+row[j-k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i+k]+row[j-k]).addClass('selectedBox');
                    $("#"+col[i+k]+row[j-k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+k]+row[j-k]).attr('ondragover','allowDrop(event,this)');

                }
                //Right Top
                for(var k=1;k<=8;k++){
                    if($("#"+col[i-k]+row[j+k]).find("img").length > 0){
                        var chil=$("#"+col[i-k]+row[j+k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                break;
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                $("#"+col[i-k]+row[j+k]).addClass('TrapBox');
                                $("#"+col[i-k]+row[j+k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i-k]+row[j+k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        break;
                    }
                    $("#"+col[i-k]+row[j+k]).addClass('selectedBox');
                    $("#"+col[i-k]+row[j+k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-k]+row[j+k]).attr('ondragover','allowDrop(event,this)');

                }
                return;
            }
        }
    }
}
function clickRedQueen(e) {
    refreshBoxes();
    var parentId=e.parentNode.id;
    for(var i=0;i<col.length;i++){
        for(var j=0;j<row.length;j++){
            if(parentId === col[i]+row[j]){
                //bottom selecter
                for(var k=1;k<=8;k++){
                    if($("#"+col[i]+row[j-k]).find("img").length > 0){
                        var chil=$("#"+col[i]+row[j-k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i]+row[j-k]).addClass('TrapBox');
                                $("#"+col[i]+row[j-k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i]+row[j-k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i]+row[j-k]).addClass('selectedBox');
                    $("#"+col[i]+row[j-k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i]+row[j-k]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){
                    if($("#"+col[i+k]+row[j]).find("img").length > 0){
                        var chil=$("#"+col[i+k]+row[j]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i+k]+row[j]).addClass('TrapBox');
                                $("#"+col[i+k]+row[j]).attr('ondrop','drop(event,this)');
                                $("#"+col[i+k]+row[j]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i+k]+row[j]).addClass('selectedBox');
                    $("#"+col[i+k]+row[j]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+k]+row[j]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){
                    if($("#"+col[i-k]+row[j]).find("img").length > 0){
                        var chil=$("#"+col[i-k]+row[j]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i-k]+row[j]).addClass('TrapBox');
                                $("#"+col[i-k]+row[j]).attr('ondrop','drop(event,this)');
                                $("#"+col[i-k]+row[j]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i-k]+row[j]).addClass('selectedBox');
                    $("#"+col[i-k]+row[j]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-k]+row[j]).attr('ondragover','allowDrop(event,this)');

                }

                for(var k=1;k<=8;k++){
                    if($("#"+col[i]+row[j+k]).find("img").length > 0){
                        var chil=$("#"+col[i]+row[j+k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i]+row[j+k]).addClass('TrapBox');
                                $("#"+col[i]+row[j+k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i]+row[j+k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i]+row[j+k]).addClass('selectedBox');
                    $("#"+col[i]+row[j+k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i]+row[j+k]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){
                    if($("#"+col[i+k]+row[j+k]).find("img").length > 0){
                        var chil=$("#"+col[i+k]+row[j+k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i+k]+row[j+k]).addClass('TrapBox');
                                $("#"+col[i+k]+row[j+k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i+k]+row[j+k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i+k]+row[j+k]).addClass('selectedBox');
                    $("#"+col[i+k]+row[j+k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+k]+row[j+k]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){
                    if($("#"+col[i-k]+row[j-k]).find("img").length > 0){
                        var chil=$("#"+col[i-k]+row[j-k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i-k]+row[j-k]).addClass('TrapBox');
                                $("#"+col[i-k]+row[j-k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i-k]+row[j-k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i-k]+row[j-k]).addClass('selectedBox');
                    $("#"+col[i-k]+row[j-k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-k]+row[j-k]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){
                    if($("#"+col[i+k]+row[j-k]).find("img").length > 0){
                        var chil=$("#"+col[i+k]+row[j-k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i+k]+row[j-k]).addClass('TrapBox');
                                $("#"+col[i+k]+row[j-k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i+k]+row[j-k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i+k]+row[j-k]).addClass('selectedBox');
                    $("#"+col[i+k]+row[j-k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i+k]+row[j-k]).attr('ondragover','allowDrop(event,this)');

                }
                for(var k=1;k<=8;k++){
                    if($("#"+col[i-k]+row[j+k]).find("img").length > 0){
                        var chil=$("#"+col[i-k]+row[j+k]).children("img");
                        for(var b=0;b<whiteTeam.length;b++){
                            if($(chil).attr('id')===whiteTeam[b]){
                                $("#"+col[i-k]+row[j+k]).addClass('TrapBox');
                                $("#"+col[i-k]+row[j+k]).attr('ondrop','drop(event,this)');
                                $("#"+col[i-k]+row[j+k]).attr('ondragover','allowDrop(event,this)');
                            }
                        }
                        for(var r=0;r<BlackTeam.length;r++){
                            if($(chil).attr('id')===BlackTeam[r]){
                                break;
                            }
                        }
                        break;
                    }
                    $("#"+col[i-k]+row[j+k]).addClass('selectedBox');
                    $("#"+col[i-k]+row[j+k]).attr('ondrop','drop(event,this)');
                    $("#"+col[i-k]+row[j+k]).attr('ondragover','allowDrop(event,this)');

                }
                return;
            }
        }
    }
}