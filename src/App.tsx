import { useState } from 'react'
import './App.css'

function App() {
  const hyphen = '-';
  const today = formatDate(new Date(), hyphen);
  const [lastUpdate, setLastUpdate] = useState<string>(today);
  const [validityPeriod, setValidityPeriod] = useState<string>('90');
  const [nextUpdate, setNextUpdate] = useState<string>('');

  const handleLastUpdateChange = async () => {
    const DaysAfter = Number(validityPeriod);
    let DateLastUpdate = new Date(lastUpdate);
    DateLastUpdate.setDate(DateLastUpdate.getDate() + DaysAfter);
    const calcResult = await calcNextWeekDay(DateLastUpdate);
    setNextUpdate(calcResult);
  };
  async function calcNextWeekDay(date: Date) {
    const YOUBIS = ['日', '月', '火', '水', '木', '金', '土'];
    let isWeekDay = false;
    let result = '';
    let NextDate = date;
    while (!isWeekDay) {
      const Youbi = NextDate.getDay();
      if (Youbi === 6) {
        NextDate = new Date(NextDate.setDate(NextDate.getDate() - 1));
      } else if (Youbi === 0) {
        NextDate = new Date(NextDate.setDate(NextDate.getDate() - 2));
      } else {
        
        try {
          const url = `https://api.national-holidays.jp/${formatDate(NextDate, hyphen)}`;
          const res = await fetch(url);
          if (res.status === 404) {
            isWeekDay = true;
            result = `${formatDate(NextDate, hyphen)} (${YOUBIS[NextDate.getDay()]})`;
            //TODO: ステータス404の時はエラーメッセージを出したくない
          } else if(!res.ok){
            isWeekDay = true;
             throw new Error(`${res.status} : ${res.statusText}`);             
          }else{
            //ステータス200＝祝日データあり＝日にちを1引いて処理続行
            NextDate = new Date(NextDate.setDate(NextDate.getDate() - 1));
          }

        } catch (error) {
          isWeekDay = true;
          result = error instanceof Error ? "取得エラー" + error.message : "不明なエラー";
          console.error(error);
        }
      }
    }
    return result;
  }

  function formatDate(date: Date, delimiter: string = '') {
    
    if (!(date instanceof Date) || isNaN(Number(date))) {
      throw new Error("Invalid Date object");
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0始まり
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${delimiter}${month}${delimiter}${day}`;
  }

  return (
    <>
    <div>
      <h2>パスワード次回更新日計算（祝日対応込み）</h2>
    </div>
    <div>
      <label htmlFor='lastUpdate'>最終更新日：  </label>
      <input
        type="date"
        name="lastUpdate"
        id="lastUpdate"
        value={lastUpdate}
        onChange={(e) => setLastUpdate(e.target.value)}
      ></input>
    </div>
    <div>
      <label htmlFor='validityPeriod'>有効期間（日）</label>
      <input
        type="number"
        name="validityPeriod"
        id="validityPeriod"
        min="0"
        max="365"
        step="1"
        value={validityPeriod}
        onChange={(e) => setValidityPeriod(e.target.value)}
      ></input>
    </div>
    <div>
      <button 
      type='submit' 
      name='calcButton' 
      className='calcButton'
      onClick={handleLastUpdateChange}>計算</button>
    </div>
      <div>
        <label htmlFor='nextUpdate'>次回更新日：  </label>
        <span id="nextUpdate">{nextUpdate}</span>
      </div>
      </>    
  )
}

export default App
