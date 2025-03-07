/* 課題に関するコードを以下に書く */
// **試行設定**
// シャッフル関数 (Fisher-Yates shuffle)
function shuffle(array) {
  let shuffled = array.slice(); // 元の配列を変更しないようにコピー
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // 配列の要素を入れ替え
  }
  return shuffled;
}

// ブロックの試行数とs1の報酬確率
const trial_num = [80, 80, 20, 20, 20, 20, 80, 20, 20, 20, 20];
const prob_s1 = [0.2, 0.8, 0.2, 0.8, 0.2, 0.8, 0.2, 0.8, 0.2, 0.8, 0.2];

// ブロックの数
const block_num = trial_num.length;
// 各ブロックの１０区切りでシャッフルするベクトル
const block_per_trial = trial_num.map(num => num / 10); 

let trials = [];
//左右位置と報酬について
for (let i = 0; i < block_num; i++) {
  for (let j = 0; j < block_per_trial[i]; j++) {
    // 1=left, 2=right を5つずつ作成してシャッフル
    let left_right_shuffle = shuffle([...Array(5).fill(1), ...Array(5).fill(2)]);
    // s1の報酬確率が 0.8 なら 80% の確率で報酬、0.2 なら 20% の確率で報酬
    let reward_s1_shuffle = prob_s1[i] === 0.8 
      ? shuffle([...Array(4).fill(1), 0, ...Array(4).fill(1), 0]) 
      : shuffle([...Array(4).fill(0), 1, ...Array(4).fill(0), 1]);
    let left_right_shuffle2 = left_right_shuffle.map(pos => 3 - pos);
    let reward_s1_shuffle2 = reward_s1_shuffle.map(pos => 1 - pos);
    for (let k = 0; k < 10; k++) {
    // left_right_shuffle に応じて left_img を設定
    let left_img = left_right_shuffle[k] === 1 ? "s1.svg" : "s2.svg";
    let right_img = left_right_shuffle[k] === 2 ? "s1.svg" : "s2.svg";

      trials.push({
        left_img: left_img,
        right_img: right_img,
        left_right_s1: left_right_shuffle[k],
        left_right_s2: left_right_shuffle2[k],
        reward_s1: reward_s1_shuffle[k],
        reward_s2: reward_s1_shuffle2[k],
      });
    }
  }
}

// **試行の流れ**
const trial_procedure = {
  timeline: [
    // **選択画面**
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function() {
      return `
      <div style='display: flex; justify-content: space-between; align-items: center; width: 800px; margin: auto; position: relative;'>
      <button id='left' style='border: none; background: none; position: absolute; left: 0;'>
        <img src='volatile-probabilistic-reversal-learning/stimuli/${jsPsych.evaluateTimelineVariable('left_img')}' width='300px'/>
      </button>
      <div style='position: absolute; left: 50%; transform: translateX(-50%); font-size: 32px; font-weight: bold;'>
        ＋
      </div>
      <button id='right' style='border: none; background: none; position: absolute; right: 0;'>
        <img src='volatile-probabilistic-reversal-learning/stimuli/${jsPsych.evaluateTimelineVariable('right_img')}' width='300px'/>
      </button>
    　</div>`;
      },
      choices: ['ArrowLeft', 'ArrowRight'], 
      data: function() {
        return {
          left_img: jsPsych.timelineVariable('left_img'),
          right_img: jsPsych.timelineVariable('right_img'),
          left_right_s1: jsPsych.timelineVariable('left_right_s1'), // 左右情報を取得
          reward_s1: jsPsych.timelineVariable('reward_s1'),
          reward_s2: jsPsych.timelineVariable('reward_s2')
        };
      },
      on_finish: function(data) {
        let selected_side = data.response === 'ArrowLeft' ? 'left' : 'right'; // キーボード入力
        let selected_img = data[selected_side + '_img'];
        // 選択結果をデータに保存
        data.selected_side = selected_side;
        data.selected_img = selected_img;
        // 報酬の決定
        if (selected_img === 's1.svg' && data.reward_s1 === 1){
          data.reward_given = 'reward.svg';
        }else if(selected_img === 's1.svg' && data.reward_s1 === 0){
          data.reward_given = 'punishment.svg';
        }else if(selected_img === 's2.svg' && data.reward_s2 === 1){
          data.reward_given = 'reward.svg';
        }else if(selected_img === 's2.svg' && data.reward_s2 === 0){
          data.reward_given = 'punishment.svg';
        }
      }
    }, // **選択画像の変更 (500ms)**
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function() {
        let last_trial = jsPsych.data.get().last(1).values()[0];
        let selected_side = last_trial.selected_side; // 左右の情報を取得
        let selected_img = last_trial.selected_img; // キーボードの選択結果

        let updated_left_img;
        let updated_right_img;
        if (selected_img === 's1.svg' && selected_side === 'left'){
            updated_left_img = 's1s.svg';
            updated_right_img = 's2.svg';  
        }else if(selected_img === 's1.svg' && selected_side === 'right'){
            updated_left_img = 's2.svg';
            updated_right_img = 's1s.svg';
        }else if(selected_img === 's2.svg' && selected_side === 'left'){
            updated_left_img = 's2s.svg';
            updated_right_img = 's1.svg';
        }else if (selected_img === 's2.svg' && selected_side === 'right') { 
           updated_left_img = 's1.svg';
           updated_right_img = 's2s.svg';
        }
        return  `
          <div style='display: flex; justify-content: space-between; align-items: center; width: 800px; margin: auto; position: relative;'>
          <button id='left' style='border: none; background: none; position: absolute; left: 0;'>
          <img src='volatile-probabilistic-reversal-learning/stimuli/${updated_left_img}' width='300px'/>
          </button>
          <div style='position: absolute; left: 50%; transform: translateX(-50%); font-size: 32px; font-weight: bold;'>
          ＋
          </div>
          <button id='right' style='border: none; background: none; position: absolute; right: 0;'>
          <img src='volatile-probabilistic-reversal-learning/stimuli/${updated_right_img}' width='300px'/>
          </button>
    　    </div>`;
      },
      trial_duration: 500,
      response_ends_trial: false
    },// **報酬 or 罰の提示 (1000ms)**
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function() {
        let last_trial = jsPsych.data.get().last(2).values()[0];
        let reward_given = last_trial.reward_given;
        return `<img src='volatile-probabilistic-reversal-learning/stimuli/${reward_given}' width='350px'/>`;
      },
      trial_duration: 1000,
      response_ends_trial: false
    },// **固視点の提示 (500~1000ms)**
    {
    　type: jsPsychHtmlKeyboardResponse,
    　stimulus:  `
          <div style='display: flex; justify-content: space-between; align-items: center; width: 600px; margin: auto; position: relative;'>
          <div style='position: absolute; left: 50%; transform: translateX(-50%); font-size: 32px; font-weight: bold;'>
          ＋
          </div>
    　    </div>`,
      trial_duration: function() {
        return Math.floor(Math.random() * 500) + 500;
      },
      response_ends_trial: false,
  }
  ],
  timeline_variables: trials
};

var welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<p><span style='font-size:20pt;'>研究に参加いただき，ありがとうございます!!!</span></p>"+
  "<p>キーボードのキーをどれか押して，開始してください</p>"
};

const instruction = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="text-align: center;">
      <img src="volatile-probabilistic-reversal-learning/stimuli/rl_instruction.svg" width="800px">
    </div>`,
  choices: ['ArrowRight'], 
};

const debrief = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {
    let reward_count = jsPsych.data.get().filter({ reward_given: 'reward.svg' }).count();
    let total_trials = trial_num.reduce((acc, val) => acc + val, 0);
    let correct_rate = ((reward_count / total_trials) * 100).toFixed(2);
    return "<p>あなたの正答率は，<strong>"+correct_rate+"%</strong>でした。</p> " +
    "<p>キーボードのキーをどれか押すと結果がCSV形式でダウンロードされます。ブラウザを閉じて終了してください。ご参加ありがとうございました。</p>";
  },
};

// マウスのカーソルを見えなくする
var cursor_off = {
    type: jsPsychCallFunction,
    func: function() {
        document.body.style.cursor= "none";
    }
}

/*タイムラインの設定*/
const timeline = [welcome, fullscreen, cursor_off, instruction, trial_procedure, debrief];