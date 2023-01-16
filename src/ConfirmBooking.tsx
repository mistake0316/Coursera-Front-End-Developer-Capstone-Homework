import { useEffect, useRef, useState } from "react";
import { submitAPI, fetchAPI } from "./fetchRelative";
import "./ConfirmBooking.css"

const dayMs = 1000*60*60*24;

interface formResultProps {
  formResult: Array<any>;
  setStatus(value:any): any;
};

interface IPeople{
  adult: number;
  child: number;
  baby : number;
}

const Form = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [timeList, setTimeList] = useState<null | Array<string>>(null);
  const [time, setTime] = useState<null|string>(null);
  const [people, setPeople] = useState<IPeople>({
    adult:0,
    child:0,
    baby:0
  });
  const [occasion, setOccasion] = useState<string>("");
  const contactRefs = {
    name: useRef<HTMLInputElement>(null),
    email : useRef<HTMLInputElement>(null),
    // phone : useRef<HTMLInputElement>(null),
  };
  const ref2value = (ref:React.RefObject<any>)=> ((ref.current !== null) && ref.current.value);
  const contactValue = Object.fromEntries(
    Object.entries(contactRefs).map(
      ([key,ref])=>([key, ref2value(ref)])
    )
  );
  const [blured, setBlured] = useState({});
  const addBlur = (s:string)=>{
    const cp_blur:any = {...blured};
    cp_blur[s] = true;
    setBlured(cp_blur)
  }
  const validFail = {
    name : !contactValue.name ? true : false,
    email: !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(contactValue.email) ? true : false,
    occasion: (occasion.trim()==="Other" || occasion==="")
  }

  const error_message = Object.fromEntries(
    Object.entries(blured)
      .map(
        ([key,isBlured])=>
        (isBlured && (validFail as any)[key]) && [key, <span key={key} style={{color:"red"}}>{key} is not valid.</span>]
      )
      .filter(elem=>elem) // prevent fromEntries error
  );

  useEffect(
    ()=>{
      if (date) setTimeList(fetchAPI(date));
      setTime(null);
    },
    [date]
  )
  return <div id="form">
    <h1>Book a Table</h1>
    <h2><label>Date</label></h2>
    <div className="list_data">
    {dateListRender(
      new Date(),
      new Date((new Date()).getTime() + 7*dayMs),
      setDate,
      date
    )}
    </div>
    <h2><label>Time</label></h2>
    { // render time in that date
      !timeList ?
      <span>"No Available Time"</span> :
      <div className="list_data">
      {
        timeList.map(
          (_time)=>{
            return <span
              className={_time!==time? "" : "selected"}
              onClick={()=>setTime(_time)}
            >
              {_time}
            </span>
          }
        )
      }
      </div>
    }
    <h2>Contact</h2>
    <div className="list_input">
      <div><input type="text" required={true} ref={contactRefs.name} placeholder="required" onBlur={()=>addBlur("name")}/><label>Name</label></div>
      {(error_message as any).name}
      <div><input type="email" required={true} ref={contactRefs.email} placeholder="required" onBlur={()=>addBlur("email")}/><label>Email</label></div>
      {(error_message as any).email}
    </div>
    <h2>Occasion</h2>
    <select id="Occasion" onChange={(e)=>setOccasion(e.target.value)} style={{textAlign:"right"}}>
      <option value="">-- Please select one of following. --</option>
      {["Birthday", "Anniversary", "Business", "None", "Other"].map(
        _occasion=>
        <option
          key={_occasion}
          value={_occasion}
        >{_occasion}</option>
      )}
    </select>
    {occasion.startsWith("Other") && <input placeholder="Please input occasion." onChange={e=>setOccasion(`Other$${e.target.value}`)}/>}
    <h2>Special Request</h2>
    <textarea
      style={{
        width:"50vw"
      }}
      placeholder="Please leave special information &#10;(e.g. cannot climb stair, allergy for peanuts, etc.)"
    >
    </textarea>
    <br/>
    <button>Submit</button>
  </div>
}

const ConfirmResult = ({formResult, setStatus} : formResultProps) => {
  console.log(formResult)
  return (
    <>
    <h1>Confirm your booking</h1>
    <div>
    {
      formResult.map(
        ([key, val])=>{
          return <div><label>{key}</label><span>{val}</span></div>
        }
      )
    }
    </div>
    <p>Confirm?</p>
    <button onClick={()=>setStatus(true)}>yes</button>
    <button onClick={()=>setStatus(false)}>yes</button>
    </>
  );
}

const dateListRender = (startDate:Date, endDate:Date, setDate:Function, inputDate: Date) => {
  const dateList = [];
  const ptrDate = new Date(startDate);
  while(ptrDate <= endDate){
    dateList.push(
      {
        disp:ptrDate.toLocaleDateString(),
        date:new Date(ptrDate.getTime())
      }
    );
    ptrDate.setTime(ptrDate.getTime()+dayMs);
  }
  return dateList.map(
    ({disp, date})=><span
      onClick={(e)=>{
        setDate(date);
      }}
      className={inputDate.getDate() !== date.getDate() ? "" : "selected"}
    >
      {disp}
    </span>
  )
}

export {Form, ConfirmResult};
export default Form;