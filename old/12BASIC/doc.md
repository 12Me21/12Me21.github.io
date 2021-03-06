# `12-BASIC` documentation

## Types

* ### Number
  >*name*
* ### String
  >*name*__$__  
  
  Falsey values are `0` and `""`

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

* ### SWITCH/CASE block
  Runs *code* if any *value* equals *switchValue*. **BREAK** is not required.
  >**SWITCH** *switchValue*  
  >&nbsp;&nbsp;&nbsp;&nbsp;[ **CASE** *value* [ , ... ]  
  >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*code* ] [...]  
  >&nbsp;&nbsp;&nbsp;&nbsp;[ **ELSE**  
  >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*code* ]  
  >**ENDSWITCH**
  
* ### BREAK
  Exits **FOR**, **WHILE**, **REPEAT** loops.
  >**BREAK** [ *levels* ]  
  
* ### EXIT
  Similar to **BREAK**, but works in all code blocks.
  >**EXIT** [ *levels* ]  
  
* ### CONTINUE
  Jumps to the end of a loop.
  >**CONTINUE**
  
## Commands

* ### PRINT
  Outputs a list of values.
  >**PRINT** [ *value* ] [ , ... ]  
  
* ### INPUT
  Stores input into a list of variables.
  >**INPUT** [ *variable* ] [ , ... ]
  
* ### STOP
  Ends the program.
  >**STOP**
  
## Operators

  * ### Negate
  >**-** *number* -> *number*
  * ### Logical Not
  >**!** *number* -> *number*  
  >**NOT** *number* -> *number*
  * ### Bitwise Not
  >**~** *number* -> *number*
  
  * ### Exponent
  >*number* **^** *number* -> *number*
  
  * ### Multiply
  >*number* __*__ *number* -> *number*
  * ### String repeat
  >*string* __*__ *number* -> *string*
  * ### Divide
  >*number* __/__ *number* -> *number*
  * ### Mod (Remainder) a-floor(a/b)*b
  >*number* __%__ *number* -> *number*
  * ### Floored Division
  >*number* __\\__ *number* -> *number*
  
  * ### Add
  >*number* **+** *number* -> *number*
  * ### String concatenate / type coercion
  >*string$* **+** *value* -> *string$*
  * ### Subtract
  >*number* **-** *number* -> *number*
  
  * ### Left Shift
  >*number* **<<** *number* -> *number*
  * ### Right Shift (unsigned)
  >*number* **>>** *number* -> *number*
  
  * ### Greater
  >*number* **>** *number* -> *number*  
  >*string$* **>** *string$* -> *number*
  * ### Less
  >*number* **<** *number* -> *number*  
  >*string$* **<** *string$* -> *number*
  * ### Greater or Equal
  >*number* **>=** *number* -> *number*  
  >*string$* **>=** *string$* -> *number*
  * ### Less or Equal
  >*number* **<=** *number* -> *number*  
  >*string$* **<=** *string$* -> *number*
  
  * ### Equal
  >*number* **==** *number* -> *number*  
  >*string$* **==** *string$* -> *number*
  * ### Not Equal
  >*number* **!=** *number* -> *number*  
  >*string$* **!=** *string$* -> *number*
  
  * ### Bitwise And
  >*number* **&** *number* -> *number*
  * ### Bitwise Or
  >*number* **|** *number* -> *number*
  * ### Bitwise Xor
  >*number* **~** *number* -> *number*
  
  * ### Logical And
  >*value* **AND** *value* -> *number*
  * ### Logical Or. Returns the first truthy value
  >*value* **OR** *value* -> *value*
  * ### Logical Xor
  >*value* **XOR** *value* -> *number*

  * ### Alternate function syntax
  The first argument can be written before the function:
  >*argument1* **.** *function*__(__ *arguments* [ , ... ] **)**  
  >*function*__(__ *argument1* **,** *arguments* [ , ... ] **)**
  
## Built-in Functions

  * ### Substring
  >**MID$(** *string$* **,** *start* **,** *length* **)** -> *substring$*
  * ### Get ASCII code
  >**ASC(** *string$* **)** -> *ascii*
  * ### Get Character
  >**CHR$(** *ascii* **)** -> *character$*
  * ### Length
  >**LEN(** *string$* **)** -> *length*
  * ### String to Number
  >**VAL(** *string$* **)** -> *number*  
  >**VAL(** *string$* **,** *base* **)** -> *number*
  * ### Number to String
  >**STR$(** *number* **)** -> *string$*  
  >**STR$(** *number* **,** *length* **)** -> *string$*  
  >**STR$(** *number* **,** *length* **,** *base* **)** -> *string$*
  * ### Random Number
  >**RND(** *range* **)** -> *number*  
  >**RND(** *minimum* **,** *maximum* **)** -> *number*
  * ### Cosine (angles range from 0 to 1)
  >**COS(** *angle* **)** -> *x*  
  >**COS(** *angle* **,** *radius* **)** -> *x*
  * ### Sine (angles range from 0 to 1)
  >**SIN(** *angle* **)** -> *y*  
  >**SIN(** *angle* **,** *radius* **)** -> *y*
  * ### Angle from X and Y (atan)
  >**ANG(** *x* **,** *y* **)** -> *angle*
  * ### Hypotenuse
  >**HYP(** *x* **,** *y* **)** -> *hypotenuse*
  * ### String search (-1 = not found)
  >**INSTR(** *string$* **,** *search$* **)** -> *location*  
  >**INSTR(** *start* **,** *string$* **,** *search$* **)** -> *location*
  * ### Uppercase
  >**UCASE$(** *string$* **)** -> *uppercase$*
  * ### Lowercase
  >**LCASE$(** *string$* **)** -> *lowercase$*
  * ### Get characters from end
  >**RIGHT$(** *string$* **,** *length* **)** -> *end$*
  * ### Get number input
  >**INPUT(** **)** -> *number*
  * ### Get string input
  >**INPUT$(** **)** -> *string$*
