## Flow control

* ### Standard IF block  
  Runs *code* if *condition* is truthy.
  
  >**IF** *condition* **THEN**  
  >&nbsp;&nbsp;&nbsp;&nbsp;*code*  
  >[ **ELSEIF** *condition* **THEN**  
  >&nbsp;&nbsp;&nbsp;&nbsp;*code* ] [...]  
  >[ **ELSE**  
  >&nbsp;&nbsp;&nbsp;&nbsp;*code* ]  
  >**ENDIF**  
  
* ### Short IF block (ELSE/ELSEIF not allowed)
  
  >**IF** *condition* **THEN** *code*
    
* ### FOR loop  
  Runs *code* for each value of *variable* between *start* and *end*
  
  >**FOR** *variable* **=** *start* **TO** *end* [ **STEP** *step* ]  
  >&nbsp;&nbsp;&nbsp;&nbsp;*code*  
  >**NEXT** [ *variable* ]  
    
* ### WHILE loop  
  Runs *code* repeatedly while *condition* is truthy.
  
  >**WHILE** *condition*  
  >&nbsp;&nbsp;&nbsp;&nbsp;*code*  
  >**WEND**  
    
* ### REPEAT loop
  Runs *code* at least once, until *condition* is truthy.
  >**REPEAT**  
  >&nbsp;&nbsp;&nbsp;&nbsp;*code*  
  >**UNTIL** *condition*  
