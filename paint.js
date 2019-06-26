var cv;//キャンバス
var ct;//コンテキスト(?)
var pen_color;//ペンの色
var pen_size;//ペンのサイズ
var pen_x;//前回のペンのx座標
var pen_y;//前回のペンのy座標
var pen_log;//変更した記録
//pen_logの中身[[キャンバス,マウスアップ、アウト時の画像データ,レイヤーを追加したかどうか、1=した、0=していない]]
var pen_shape;//ペンの形
var check;//マウスダウンの判定
var count;//pen_logの個数
var count2;//
var one;
var two;
var lyr;//新しいキャンバス
var lyr_max;//レイヤーの最大数
var lyr_num;//現在選択しているレイヤーのキャンバス名
var select;//現在選択しているレイヤーの番号
var n;//ボディーのid
var null_img;//キャンバスの最初の画像データ
var x;
var y;

//初期化
function start(){
	document.getElementById("lyr_slc").value = 1;
	count = 0;
	count2 = 0;
	select = 1;
	lyr_max = 1;
	n = document.getElementById("v");
	cv = document.getElementById("canvas1");
	ct = cv.getContext("2d");
	null_img = ct.getImageData(0, 0, cv.width, cv.height);
	ct.fillStyle = "white";
	ct.fillRect(0,0,cv.width,cv.height);
	pen_shape = "round";
	pen_x = "";
	pen_y = "";
	pen_log = [];
	pen_log[count] = [cv, null_img, 0];
	one = true;
	two = true;

	cv.addEventListener("mousemove", move, false);
	cv.addEventListener("mousedown", down, false);
	n.addEventListener("mouseup", end, false);
	cv.addEventListener("mouseout", out, false);
}

//マウスムーブの処理
function move(e){
	if(check === 1){
		var rect = e.target.getBoundingClientRect();
		x = e.clientX - rect.left;
		y = e.clientY - rect.top;
		drow(x, y);
	}
}

//マウスダウンの処理
function down(e){
    //undoした後に描画する場合後ろのpen_logを削除する
	if(pen_log[count + 1] != null){
		pen_log.splice(count + 1, count2 - count);
	}
	check = 1;
	count++;
	count2 = count;

	//現在の選択しているレイヤーと前回選択していたレイヤーが同じか判定
	if(select != document.getElementById("lyr_slc").value){
		select = document.getElementById("lyr_slc").value;
		lyr_num = "canvas" + select;
		cv = document.getElementById(lyr_num);
		ct = cv.getContext("2d");
	}
    
	//座標取得
	var rect = e.target.getBoundingClientRect();
	x = e.clientX - rect.left;
	y = e.clientY - rect.top;
	drow(x, y);
}

function drowing(paint){
	if(paint == "pen"){
		two = true;
	}
	else{
		two = false;
	}
}

//描画の関数
function drow(x, y){
    if(check === 0){
        return;
    }
	pen_color = document.getElementById("color").value;
	pen_size = document.getElementById("num").value;
	//ペンのサイズが正しいか判定
	if (pen_size > 100 || pen_size < 0 || pen_size == ""){
		alert("ペンのサイズが範囲外");
		document.getElementById("num").value = 10;
		return;
	}

	ct.beginPath();
	if (pen_x === ""){//mousedownした時
		ct.moveTo(x, y);
	}
	else {//moveしている時
		ct.moveTo(pen_x, pen_y);
	}
	ct.lineTo(x, y);
	ct.lineCap = pen_shape;
	ct.lineWidth = pen_size;

	if(two == true){
		ct.strokeStyle = pen_color;
		ct.globalCompositeOperation = "source-over";
	}
	else{
		ct.globalCompositeOperation = "destination-out";
	}

	ct.stroke();

	pen_x = x;
	pen_y = y;
}

//マウスアップの処理
function end(){
	console.log("end");
	check = 0;
	pen_x = "";
    pen_y = "";
    //pen_logの更新
	pen_log[count] = [cv, ct.getImageData(0, 0, cv.width, cv.height), 0];
}

//マウスアウト時の処理
function out(e){
	var rect = e.target.getBoundingClientRect();
	x = e.clientX - rect.left;
	y = e.clientY - rect.top;
	if(check === 1){
		drow(x, y);
    }
    end();
}

//ペンの形
function Pshape(shape){
	pen_shape = shape;
}

//undo
function undo(){
	if(count === 0){
		return;
    }
    //レイヤーを追加していた場合の処理
	if(pen_log[count][2] == 1){
		lyr_max--;
		document.getElementById("lyr_slc").max = lyr_max;
		document.getElementById("lyr_slc").value = lyr_max;
		n.removeChild(pen_log[count][0]);
		count--;
		pen_log[count][0].getContext("2d").putImageData(pen_log[count][1], 0, 0);
		return;
    }
    //作業していたキャンバスが異なる場合
	if(pen_log[count][0].id != pen_log[count - 1][0].id && pen_log[count][2] != 1){
		pen_log[count][0].getContext("2d").putImageData(null_img, 0, 0);
		count--;
		pen_log[count][0].getContext("2d").putImageData(pen_log[count][1], 0, 0);
        //直前の作業をしていたレイヤーに戻る
        document.getElementById("lyr_slc").value = pen_log[count][0].id.replace(/canvas/g, "");
		return;
    }
	count--;
	pen_log[count][0].getContext("2d").putImageData(pen_log[count][1], 0, 0);
}

//redo
function redo(){
	if(pen_log[count + 1] == null){
		return;
	}
    count++;
    //レイヤーを追加していた場合の処理
	if(pen_log[count][2] == 1){
		one = false;
		layer();
		one = true;
		pen_log[count][0].getContext("2d").putImageData(pen_log[count][1], 0, 0);
		return;
    }
    //作業していたレイヤーが異なる場合
	if(pen_log[count][0].id != pen_log[count - 1][0].id && pen_log[count][2] != 1){
		count++;
		pen_log[count][0].getContext("2d").putImageData(pen_log[count][1], 0, 0);
		document.getElementById("lyr_slc").value = pen_log[count][0].id.replace(/canvas/g, "");
		return;
    }
	pen_log[count][0].getContext("2d").putImageData(pen_log[count][1], 0, 0);
}

//レイヤーの追加
function layer(){
	lyr_max++;
	document.getElementById("lyr_slc").max = lyr_max;
	document.getElementById("lyr_slc").value = lyr_max;
	lyr =  document.createElement("canvas");
	lyr.id = "canvas" + lyr_max;
	lyr.style.border = "solid 1px black";
	lyr.style.position = "absolute";
	lyr.style.left = "8px";
	lyr.style.top = "8px";
	n.appendChild(lyr);

	cv = document.getElementById(lyr.id);
	ct = cv.getContext("2d");
	cv.width = 800;
	cv.height = 500;
	cv.addEventListener("mousemove", move, false);
	cv.addEventListener("mousedown", down, false);
	cv.addEventListener("mouseup", end, false);
	cv.addEventListener("mouseout", end, false);

	if(one == true){
		count++;
		count2 = count;
	}
	pen_log[count] = [cv, ct.getImageData(0, 0, cv.width, cv.height), 1];


}
