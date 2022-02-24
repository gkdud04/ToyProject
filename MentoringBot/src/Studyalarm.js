// 1. 기본적인 알람

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg == "!출석") {
        replier.reply("이름" + "님이 스터디에 출석하셨습니다");
    } else {
        (mgs == "!종료")
        replier.reply("이름" + "님이 스터디를 마쳤습니다")
    }
}

// 추가해야 할 것, 이름부분 (목록 만들어서 리스트로)
// 시간 추가, 자동 메시지 - 스터디, 멘토링 알림


// 2. 24시간 후 출석 데이터 초기화

var setTimeout,
    clearTimeout,
    setInterval,
    clearInterval;

var timer = new java.util.Timer();
var counter = 1;
var ids = {};

setTimeout = function (fn, delay) {
    var id = counter++;
    ids[id] = new JavaAdapter(java.util.TimerTask, { run: fn });
    timer.schedule(ids[id], delay);
    return id;
}

clearTimeout = function (id) {
    ids[id].cancel();
    timer.purge();
    delete ids[id];
}

setInterval = function (fn, delay) {
    var id = counter++;
    ids[id] = new JavaAdapter(java.util.TimerTask, { run: fn });
    timer.schedule(ids[id], delay, delay);
    return id;
}

clearInterval = clearTimeout;


// 3. IT 지식 퀴즈봇 관련 코드 (미완성)

if (msg.startsWith('1help')) {
    replier.reply(help());
}

if (msg.startsWith('1quiz')) {
    replier.reply(get_quiz(room));
}

if (msg.startsWith('1a ')) {
    let answer = msg.substr(3);
    replier.reply(answer_quiz(room, answer, sender));
}

if (msg.startsWith('1ㅁ ')) {
    let answer = msg.substr(3);
    replier.reply(answer_quiz(room, answer, sender));
}

if (msg.startsWith('1pass')) {
    replier.reply(pass_quiz(room, sender));
}

if (msg.startsWith('1hint')) {
    replier.reply(hint_quiz(room));
}

if (msg.startsWith('1rank')) {
    replier.reply(ranking(room));
}
}

function help() {
    let msg = '(⊙_⊙)？봇 사용법\n' + '\u200b'.repeat(500);
    const help_msg = [
        '1help: 도움말을 출력합니다',
        '1quiz: 퀴즈를 시작합니다',
        '1a [정답]: 퀴즈의 정답을 맞춥니다',
        '1ㅁ [정답]: 퀴즈의 정답을 맞춥니다',
        '1pass: 현재 퀴즈를 패스합니다',
        '1hint: 현재 퀴즈에 힌트를 출력합니다',
        '1rank: 퀴즈 순위를 출력합니다',
    ];

    msg += help_msg.join('\n');

    return msg;
}

let sdcard = android.os.Environment.getExternalStorageDirectory().getAbsolutePath(); //절대경로

function save(originpath, content) {
    // originpath는 sdcard/폴더/파일
    var splited_originpath = originpath.split('/');
    splited_originpath.pop();
    var path = splited_originpath.join('/');

    var folder = new java.io.File(path);
    folder.mkdirs();
    var file = new java.io.File(originpath);
    var fos = new java.io.FileOutputStream(file);
    var contentstring = new java.lang.String(content);
    fos.write(contentstring.getBytes());
    fos.close();
}

function read(originpath) {
    var file = new java.io.File(originpath);
    if (file.exists() == false) return null;
    try {
        var fis = new java.io.FileInputStream(file);
        var isr = new java.io.InputStreamReader(fis);
        var br = new java.io.BufferedReader(isr);
        var temp_br = br.readLine();
        var temp_readline = '';
        while ((temp_readline = br.readLine()) !== null) {
            temp_br += '\n' + temp_readline;
        }
        try {
            fis.close();
            isr.close();
            br.close();
            return temp_br;
        } catch (error) {
            return error;
        }
    } catch (error) {
        return error;
    }
}

let quiz_room = {};
let quiz_list = JSON.parse(read(sdcard + '/bot/quiz.json'));
let quiz_pass = {};
let user_score = JSON.parse(read(sdcard + '/bot/user.json'));

function quiz_make() {
    let quiz = quiz_list[Math.floor(Math.random() * quiz_list.length)];
    return quiz;
}

function quiz_exist(room) {
    return quiz_room.hasOwnProperty(room);
}

function get_quiz(room) {
    if (!quiz_room.hasOwnProperty(room)) {
        quiz_room[room] = quiz_make();
    }

    let output = '문제: ' + quiz_room[room][0] + '\n';
    output += '주제: ' + quiz_room[room][1];

    return output;
}

function pass_quiz(room, sender) {
    if (!quiz_exist(room)) {
        return '아직 출제한 퀴즈가 없습니다.';
    }

    if (!quiz_pass.hasOwnProperty(room)) {
        quiz_pass[room] = [];
    }
    let output = '';
    if (!quiz_pass[room].includes(sender)) {
        quiz_pass[room].push(sender);
        output += sender + '님이 퀴즈를 패스하셨습니다.\n';
        output += '총 3명이 패스를 하면 퀴즈가 넘어갑니다.\n';
        output += '현재 패스한 사람: ' + quiz_pass[room].join(', ') + '\n';
        output += '총 ' + quiz_pass[room].length + '명';
    } else {
        return sender + '님은 이미 패스하셨습니다.';
    }

    if (quiz_pass[room].length === 3) {
        output = '!!문제를 패스합니다!!\n정답은 ' + quiz_room[room][3] + ' 이었습니다!';
        delete quiz_room[room];
        delete quiz_pass[room];
    }
    return output;
}

function hint_quiz(room) {
    if (!quiz_exist(room)) {
        return '아직 출제한 퀴즈가 없습니다.';
    }

    return '힌트: ' + quiz_room[room][2];
}

function answer_quiz(room, answer, sender) {
    if (!quiz_exist(room)) {
        return '아직 출제한 퀴즈가 없습니다.';
    }

    let output = '';

    answer = answer.toUpperCase().replace(/ /g, "");

    if (quiz_room[room][3] == answer) {
        output = sender + '님\n!!정답입니다!!\n';
        output += '정답은 "' + quiz_room[room][3] + '" 이었습니다!\n';
        if (!user_score.hasOwnProperty(room)) {
            user_score[room] = {};
        }
        if (!user_score[room].hasOwnProperty(sender)) {
            user_score[room][sender] = 1;
        } else {
            user_score[room][sender] += 1;
        }
        save(sdcard + '/bot/user.json', JSON.stringify(user_score));
        output += '점수: ' + user_score[room][sender];
        delete quiz_room[room];
        delete quiz_pass[room];
    } else {
        output = sender + '님\n!!오답입니다!!';
    }
    return output;
}

function ranking(room) {
    let output = room + '방 랭킹 정보\n' + '\u200b'.repeat(500);
    let score = [];
    for (let key in user_score[room]) {
        score.push([key, user_score[room][key]]);
    }
    score.sort(function (a, b) {
        return b[1] - a[1];
    });
    for (let i = 0; i < score.length; i++) {
        output += i + 1 + '등 ' + score[i][0] + ': ' + score[i][1] + '점\n';
    }
    return output;

    /* 퀴즈봇은 두개의 json파일 정보를 입출력하여 활용해야 한다
        user.json, quiz.json으로 각각 유저의 퀴즈점수, 퀴즈 정보를 관리해야 합니다
        각각의 파일을 만들어서 sd카드 위치를 기점으로 bot폴더를 생성한 후 그 안에 두 파일을 넣어준다
            quiz.json은 2차원 배열로 이루어져야 하며 [문제, 주제, 힌트, 정답] 순으로 구성해야 합니다
    */


    // 4. 수료 시작-종료일 알려주기

    if (msg == "계산") {
        var date = new Date();
        start = new Date(2021, 12, 20); // 과정 시작일 날짜 
        end = new Date(2022, 06, 07); //수료 날짜 
        today = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate()); //오늘 날짜 
        between = end - start; //과정 날짜(ms) 계산 
        // var total= between/(1000*3600*!!); //총 공부일 계산  
        // var remaining= (end-today)/(1000*3600*!!) ; //남은 공부일 계산 
        // var current = (today-start)/(1000*3600*!!); //현재 공부일 계산 
        var percent = current / total * 100; //퍼센트(%) 계산 
        replier.reply("과정 전체 기간: " + total + "일\n현재까지 공부한 날 : " + current + "일\n수료까지 남은 기간 : " + remaining + "일\n과정 진행률 : " + percent.toFixed(1) + "%");
    }

    // 계산식은 수료 과정에 맞게 고쳐야 합니다!


    // 5. 봇 상태

    else if (msg.trim() == "/배터리") {
        var fill = ["알수없음", "충전중", "충전중 아님", "충전완료 후 충전중 아님", "충전 완료"];
        var ifilter = new android.content.IntentFilter(android.content.Intent.ACTION_BATTERY_CHANGED);
        var batteryStatus = Api.getContext().registerReceiver(null, ifilter);
        var battery = batteryStatus.getIntExtra(android.os.BatteryManager.EXTRA_STATUS, -1);
        var voltage = batteryStatus.getIntExtra(android.os.BatteryManager.EXTRA_VOLTAGE, -1);
        var level = batteryStatus.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1);
        var scale = batteryStatus.getIntExtra(android.os.BatteryManager.EXTRA_SCALE, -1);
        var am = Api.getContext().getSystemService(Api.getContext().ACTIVITY_SERVICE);
        var mem = new android.app.ActivityManager.MemoryInfo();
        am.getMemoryInfo(mem);
        var temp = batteryStatus.getIntExtra(android.os.BatteryManager.EXTRA_TEMPERATURE, -1);
        var ms1 = java.lang.System.currentTimeMillis();
        var ms2 = java.lang.System.currentTimeMillis();
        var ps = (((ms2 - ms1) / 1000) + "초");
        replier.reply("전원 : 켜짐\n현재상태 : " + fill[battery - 1] + "\n램 : " + (mem.availMem / mem.totalMem * 100).toFixed(2) + "% 남음\n배터리 : " + Math.round(level / scale * 100) + "%\n온도 : " + Math.round(temp) / 10 + "°C\n전압 : " + voltage + "mv");
    }

}