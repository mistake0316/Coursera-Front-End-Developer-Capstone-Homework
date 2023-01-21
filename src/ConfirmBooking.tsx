import React, { useEffect, useRef, useState } from "react";
import { submitAPI, fetchAPI } from "./fetchRelative";
import "./ConfirmBooking.css"
import { useContext } from "react";
import FloatingPanelContext from './contexts'
import { readBuilderProgram } from "typescript";

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
  const total_people = Object.values(people).reduce((partialSum, a) => partialSum + a, 0);
  const cap_people = 6;
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
    time : time == null,
    people: total_people===0,
    name : !contactValue.name,
    email: !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(contactValue.email),
    occasion: occasion==="",
  }

  const error_message = Object.fromEntries(
    Object.entries(blured)
      .map(
        ([key,isBlured])=>
        (isBlured && (validFail as any)[key]) && [key, <span key={key} style={{color:"red"}}>{key} is not valid.</span>]
      )
      .filter(elem=>elem) // prevent fromEntries error
  );
  const specialRequestRef = useRef<HTMLTextAreaElement>(null);

  const result = {
    date:date.toLocaleDateString(),
    time:time,
    people:people,
    contact: contactValue,
    occasion: occasion,
    "special request":(
      (specialRequestRef.current !== null)
      && specialRequestRef.current.value
      || "NO SPECIAL REQUEST"
    )
  };
  const render_obj = (elem:object)=>{
    return <>
      {Object.entries(elem).map(
        ([_key, _elem])=>{
          return <div>
            <div className="key">{_key}</div>
            {
              typeof _elem !== "object"
              ? <span>{_elem}</span>
              : <div className="shift">{render_obj(_elem)}</div>
            }
          </div>
        }
      )}
    </>
  }

  const {setPanel, currentPanel} = useContext(FloatingPanelContext);

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
    <h2>People</h2>
    <div id="people-panel">
      {
        ["adult", "child", "baby"].map(
          key=>{
            const val = (people as any)[key];
            const handleVal = (shift:number)=>{
              const copy_people :any = {...people};
              if (
                (shift > 0 && total_people < cap_people) ||
                (shift < 0 && copy_people[key] > 0)
              ){
                copy_people[key] += shift;
              }
              setPeople(copy_people);
            };
            return <div>
              <span className={"but"+ (val > 0 ? "" : " disable")} onClick={()=>handleVal(-1)}>-</span>
              <span className={val == 0 ? "gray" : ""}> {val} {key.charAt(0).toUpperCase() + key.slice(1)} </span>
              <span className="tooltip">
                <span className={"but"+ (total_people < cap_people ? "" : " disable")} onClick={()=>handleVal(+1)}>+</span>
                {total_people === cap_people && <span className="tooltiptext">Current max booking for total 6 people</span>}
              </span>
            </div>
          }
        )
      }
    </div>
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
      ref={specialRequestRef}
      placeholder="Please leave special information &#10;(e.g. cannot climb stair, allergy for peanuts, etc.)"
    >
    </textarea>
    <br/>
    <button
      onClick={ 
        ()=>{// generate "floating-panel"
          const already_render = document.getElementById("floating-panel")!==null;
          if(already_render)return null;
          const errors = Object.entries(validFail)
            .filter(
              ([key,isFail])=>isFail
            )
            .map(
              ([key,..._])=>key
            );
          const has_error = errors.length > 0;
          setPanel && setPanel(
            <div
              id="floating-panel"
              className={has_error? "error":""}
            >
              <div style={{
              }}>
                <h1>{
                  has_error
                  ? `Please fix following field${errors.length > 1 ? "s":""}`
                  : `Last Step`
                }</h1>
                {!has_error && <p>Please confirm following information.</p>}
                <div style={{
                  display:"flex",
                  justifyContent:"center",
                  alignItems:"center",
                  flexDirection:"column"
                }}>
                  {
                    has_error &&
                    errors.map(
                      key=>
                      <span
                        style={{
                          padding:".2em",
                          margin:".2em",
                          borderRadius: "0.5em",
                          borderColor: "black",
                          borderStyle: "dotted",
                          backgroundColor:"white",
                        }}
                      >
                        {key}
                      </span>
                    )
                  }
                  {
                    !has_error &&
                    <>
                      <div className="expand_result">
                      {
                        render_obj(result)
                      }
                      </div>
                      <div
                        style={{
                          display:"flex",
                          flexDirection:"row"
                        }}
                      >
                        <div
                          className="button"
                          onClick={()=>{
                            const close = document.getElementById("close-panel-button");
                            if(close) close.click();
                          }}
                        >
                          Something wrong
                        </div>
                        <div
                          className="button"
                          onClick={()=>{
                            setPanel(submitResult(result))
                          }}
                        >
                          All correct!
                        </div>
                      </div>
                    </>
                  }
                </div>
              </div>
              <span
                id="close-panel-button"
                style={{
                  position:"absolute",
                  top:0,
                  right:0,
                  padding:"1em",
                  fontSize:"2em",
                  cursor:"pointer"
                }}
                onClick={()=>{
                  const panel = document.getElementById("floating-panel");
                  if(panel && !("removing" in panel.classList)){
                    panel.classList.add("removing");
                    panel.style.opacity = "0";
                    panel.style.transition="1s";
                    setTimeout(
                      ()=>{
                        setPanel(null); // panel.remove();
                      }, 1000
                    );
                  }
                }}
              >
                X
              </span>
            </div>
          );
        }
      }
    >
      Submit
    </button>
  </div>
}

const submitResult = (result:any)=>{
  const resp = submitAPI(result);
  if(resp){
    return <>
      <div id="floating-panel" className="info">
        <h1>Success!</h1>
        <div>The information already send to "{result.contact.email}"", see you soon!</div>
      </div>
    </>
  }
  else{
    return <div id="floating-panel">Some error happen, please refresh the page</div>
  }
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

export {Form};
export default Form;