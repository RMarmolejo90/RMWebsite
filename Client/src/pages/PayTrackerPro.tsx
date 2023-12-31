/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useRef, useState } from 'react';
import { useTrackerContext } from '../utils/useTrackerContext';
import * as React from 'react';
import Timer from '../components/Timer';
import ProNet from '../components/ProComponents/ProNet';
import axios from 'axios';
import History from '../components/ProComponents/History';

const PayTrackerPro: React.FC = () => {
  const { displayNet, grossPay, isActive, submittedRate, elapsedTime, setSubmittedRate, setDisplayNet, setGrossPay, setIsActive, setElapsedTime} = useTrackerContext();
  const [inputRate, setInputRate] = useState(0);
  // const [submittedRate, setSubmittedRate] = useState (
  //   isActive && localStorage.getItem('activeSubmittedRate') !== null ? +localStorage.getItem('activeSubmittedRate')! : 0);
  const [startTime, setStartTime] = useState<number>(0);
  const payPerSecond = Number(submittedRate / 3600);
  const activeTimer: string = localStorage.getItem('activeTimer') ?? 'false';

  
  type Shift = {
    timeIn: number, 
    endTime: number,
    grossPay: number,
    netPay: number,
    hoursWorked: string,
    date: string,
    _id: string,
    userId: string
  }
  const [history, setHistory] = useState<Shift[]>([]);
  
  // defines time
  const hours: number = Math.floor(elapsedTime / 3600);
  const minutes: number = Math.floor((elapsedTime % 3600) / 60);
  const seconds: number = Math.floor(elapsedTime % 60);
  const storedNetPay: string | null = localStorage.getItem('netPay');
  const netPayNumberType: number | null = parseFloat(storedNetPay!);
  const activeSubmittedRateString: string = localStorage.getItem('activeSubmittedRate') ?? '0';
  const activeSubmittedRateNumber: number = +activeSubmittedRateString;
  
  // access user info for request headers
  const token: string = localStorage.getItem('Token')!;
  const userId: string = localStorage.getItem('UserId')!;
  const headers = {
    authorization: token,
    userId: userId
  }
  const startClickHeader = {
    userId: userId
  }
  
  // Fetch isActive status from local storage for page refresh
  useEffect(() => {
    if (activeTimer === 'true'){
        setIsActive(true);
    }
  }, []);

  //Update start time from local storage on mount
  useEffect(() => {
    if (localStorage.getItem('startTime')){
      setStartTime(+(localStorage.getItem('startTime'))!)}
  }, []);


  // Fetch History
  const fetchHistory = async () => {
    console.log(`request headers ${headers}`);
    try {  
      if (userId !== null) { // Make sure userId is not null
        const response = await axios.get('http://localhost:3000/user', 
        {headers: headers}
        );
        console.log(`response = ${response}`);
        console.log(`grosspay = ${grossPay}`);
        console.log(`stored netpay = ${storedNetPay}`);
        console.log(`display net = ${displayNet}`);
        console.log(`isactive ${isActive}`);
        if (response.status !== 204){
        const shiftLog = response.data;
        setHistory(shiftLog);}
    } else {
        console.error('User ID not available');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Collect user history from db on mount
  useEffect(() => {
    fetchHistory();
  }, []);


    
  // timer function  
  // this counts elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      if (isActive && startTime !== 0) {
        const currentTimeStamp: number = (new Date().getTime());
        const elapsedTimeInSeconds: number = (currentTimeStamp - startTime) / 1000;
        setElapsedTime(elapsedTimeInSeconds);
        console.log(`storedTime: ${startTime} & currentTime: ${currentTimeStamp}`);
        console.log(`elapsed time: ${elapsedTime}, timeInSeconds ${elapsedTimeInSeconds}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);
  
    // updates the displayNet state with netpay from local storage
    // this is used to update the displayed net pay on the page

    useEffect (() => {
      if (netPayNumberType !== null && !isNaN(netPayNumberType))
      setDisplayNet(netPayNumberType);
  }, [netPayNumberType, setDisplayNet]);
  
    // this is the db schema for reference
    // timeIn: Number,  
    // endTime: Number,
    // grossPay: Number,
    // netPay: Number,
    // hoursWorked: string,
    // date: String,
    // userId: String

    const handleStopClick = async (updatedShiftDuration:string) => {
      try{
        const shiftData = {
          endTime:Date.now(),
          grossPay: grossPay,
          netPay: displayNet,
          hoursWorked: updatedShiftDuration,
        }               
        setElapsedTime(0);
        localStorage.removeItem('startTime');
        localStorage.setItem('activeTimer', JSON.stringify(false));
        localStorage.removeItem('startButton');
        setIsActive(false);
        console.log("timer is not active");
        console.log(`clocking out: ${JSON.stringify(shiftData)}`);
        const response = await axios.put('http://localhost:3000/clock-out', shiftData);
        const responseStatus = response.status;
        if(responseStatus === 200){
          alert(`${updatedShiftDuration} - $${grossPay}`);
          fetchHistory()
        }

        } catch(error) {
          console.error(error);
        }

      }

      const handleStartClick: () => void = async () => {
        const newStartTime: number = new Date().getTime();
        setStartTime(newStartTime);
        console.log(`user id: ${startClickHeader}`);
        axios.post('http://localhost:3000/clock-in', startClickHeader);
        localStorage.setItem('startTime', JSON.stringify(newStartTime));
        localStorage.setItem('activeTimer', JSON.stringify(true));
        localStorage.setItem('startButton', "Stop");
        setIsActive(true);
        console.log("timer-active");
        console.log("startTime : ", startTime);
      }


  // this updates the gross pay counter

  const grosspayCalculation: number = elapsedTime * payPerSecond;
  useEffect(() => {
    if (isActive){
      setGrossPay(grosspayCalculation)}
  },[submittedRate, elapsedTime, isActive, payPerSecond]);


  const placeholderText: string = "Pay Rate : " + submittedRate;

  // handles the form         

  const handleRate = (event: React.ChangeEvent<HTMLInputElement>) => {      
      setInputRate(+event.target.value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  console.log(`hourly rate is ${inputRate}`);
  setSubmittedRate(inputRate);
  setInputRate(0);
  localStorage.setItem('activeSubmittedRate', JSON.stringify(inputRate));
  console.log(`submit click rate ${activeSubmittedRateNumber}, ${activeSubmittedRateString}`);

  }

  // Select all the text in the input element when you click the input field
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectRange = () => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(0, 99);
    }
  };

  return (
    <div className='p-8'>
      <h1 className='text-3xl pb-10 text-center text-blue-400 border-b-2 border-orange-500 font-tilt'>Real-Time Pay Tracker</h1>
      <div className='flex flex-wrap flex-col md:flex-row flex-auto justify-around items-center p-6'>
          <h2 className='text-2xl font-semibold m-6'>
              Gross: ${ grossPay.toFixed(2) }
          </h2>

          {displayNet != null ? <h2 className='text-2xl font-semibold m-6'>
              Net: ${ displayNet.toFixed(2) }
          </h2> :
          <div className='hidden'></div>
          }
          { (activeSubmittedRateNumber !== 0) ? <Timer
              hours = { hours }
              minutes = { minutes }
              seconds = { seconds }
              handleStopClick = { handleStopClick }
              handleStartClick = { handleStartClick }
          /> : <div className="hidden">Submit your hourly pay rate</div>}
      </div> 
      <div className='flex flex-auto flex-col flex-wrap justify-center items-center'> 
              <div className='border-zinc-700 border-4 p-6 flex flex-auto flex-col flex-wrap justify-center items-end m-6'>
                  <h3 className='mr-6'>
                      Hourly Rate: ${ activeSubmittedRateNumber }
                  </h3>
                  <form className='outline-slate-600 m-6 flex flex-auto flex-col justify-center items-end' onSubmit={ handleSubmit }>
                      <input 
                      className='text-slate-600 bg-slate-50 rounded-sm py-1.5 px-3 lg:mr-4 my-3 '
                      placeholder = {placeholderText}
                      min = "0"
                      type="number"
                      step="0.01" 
                      value={ inputRate } 
                      onChange={ handleRate } 
                      onClick={ selectRange }
                      />
                      <button className=' my-3 bg-blue-500 border-slate-500 rounded-md text-slate-100 font-semibold p-1.5' type="submit">Submit</button>
                  </form>
              </div>
              <div className='flex flex-col items-center justify-center'>
                  <ProNet />
              </div>
      </div>
      <div>
        <History 
        history = {history}
        fetchHistory={fetchHistory}
        />
      </div>
    </div>
  )
}

export default PayTrackerPro;
