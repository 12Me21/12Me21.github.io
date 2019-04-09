Note: Spaces have been added for readability




'Calling CONTROLLER with 0 outputs would crash SB. I hid an OUT with 2 empty arguments at the end of the line.
CONTROLLER 0                   out ,

'This is the background noise for the character selection screen. It's just a single low-pitched note.
BGMPLAY @310T1N0*99
'Instead of using [ ] MML loops, I just repeat the MML string 99 times so it plays longer (This is so I can use a label string)
'BGMPLAY@310T1N0*99...
'BGMPLAY"310T1[N0]"...
'It doesn't actually save any characters lol
'EDIT:
'Nevermind, I made a misake:
'BGMPLAY"@310T1[N0]"... would be 1 char longer

ACLS

'Displaying the list of controls:
?"←→ Move"
?" Jump"
?" Mine"
?
?"↑↓ Select"

'Setting the initial player position:
X=192
Y=264
'Originally, there was nothing to stop you from falling off the bottom of the screen.
'If there wasn't a solid tile below you in the first 4 generated rows, you'd fall past the point where tiles are generated,
'and either fall forever or freeze the game if a tile is drawn on top of the player.
'X=192 was chosen so that the player is on the boundary between 2 columns, doubling the chance of a tile spawning below you.
'This caused the game to only freeze 6% of the time, instead of 13%!
'(Eventually I had to add a check in the collision function, when it became easier to reach the bottom of the screen while playing).

'Character selection menu:
@C
	VSYNC
	B=BUTTON(2)
	'D is the index of the currently selected character.
	D=PCMPOS
	'The system variable PCMPOS is accessible even if you don't have the sound DLC.
	'It can be written and read, and its value persists after the program ends so the next time you start the game,
	'it defaults to whatever character you chose the last time.
	PCMPOS=MIN(D-SGN(B<<30),17)+(D<0)
	'-SGN(button<<30) extracts the d-pad Y-axis.
	'The maximum value is limited normally (using MIN), but to save space I just add 1 if D<0, instead of using MAX.
	'Because of this, it's possible to select character "-1" for 1 frame.
	
	'C is used as the offset for the player's sprite in the game.
	'The player character sprite definitions start at 2544, and each character has 20 sprites.
	C=2544+D*20
	
	'For the animation, I cycle through the first 12 sprites for the current character (these are left, down, and right facing)
	'(I skip the upwards facing sprites, since they aren't used in the game.)
	SPSET .,C+A/9 MOD 12
	'A is divided by 9 to slow down the animation.
	
	'X is 192, which is pretty close to the middle of the screen.
	SPOFS .,X,X
	SPSCALE .,5,5
	
	'Animation counter:
	A=A+1
	
'Loop ends when any button is pressed except the d-pad.
ON B>>4 GOTO @C
'This will jump to @C as long as B>>4 is 0.
'Shifting B (BUTTON(2)) right 4 will get rid of the 4 lowest bits (corresponding to the d-pad buttons)
'So the result is nonzero if any other buttons are pressed.

'The music is based off of the song from Cave Platformer, which was already a modified version of BGM 47 from FREEBGM_RWI
BGMPLAY "{G=G1&GC8D8D#2GF2}@44>)16[[R1]4G2.A#A2.D#F1&F1A#2.<DC2.>FG2&{G}A#8F8{G}DC1&CR]:1@262>[[CGFA#]12[CGF]7C2.]:2@19>>[[R]60[C2.]4]"
'I had already shortened the MML as much as possible, so here I just removed some effects and changed the instruments and tempo.

'1<<24 is a useful value.
E=1<<24
'-(1<<24) is #BLACK
FADE -E
FADE .,160

'The pickaxe sprites are SPLINKed to this sprite, which is moved as the level scrolls.
SPSET 1,1380
'Originally it was possible to see it for a few frames as the game starts, but not really in the final version.
'I could've saved 3 characters by using a lower definition number...

BACKCOLOR #PURPLE
'Usually I'd put CLS in the main loop, but because I set the text background color, using CLS would fill the screen.
CLS

'Q is the depth where the next pickaxe will spawn.
Q=14

'Main loop:
@L
	VSYNC
	
	'T is the player's Y velocity
	T=T+.1 'gravity
	
	P=BUTTON()
	'Print the current depth (score)
	LOCATE ,2
	'Need to use LOCATE since I can't CLS.
	?"Depth:";V
	
	'S is the player's X velocity
	S=S*.8-SGN(P/4<<30)/5
	'Each frame it is multiplied by 0.8, and the d-pad x-axis direction (divided by 5) is added.
	
	'Normally you'd SPSET the player sprite once, and use SPCHR to change it. But this is shorter, of course.
	SPSET .,C+4-4*SGN(S)OR A/6AND 3
	'Each player character has 20 sprites. There are 5 groups with 4 frames of animation each.
	'base+0 - walking right
	'base+4 - walking down
	'base+8 - walking left
	'base+12 - walking up (not used here)
	'base+16 - dead (not used here)
	
	'Here, the group is chosen by `base + 4 - (4 * SGN(velocity))`.
	'negative velocity -> base + 4 + 4 (base+8, walking left)
	'       0 velocity -> base + 4 - 0 (base+4, walking down)
	'positive velocity -> base + 4 - 4 (base+0, walking right)
	
	'A/6 AND 3 will be a number from 0 to 3, and this is added so it will cycle through all 4 frames of each animation.
	
	'Enable collision
	SPCOL .
	
	'X-AXIS MOVEMENT:
	'The function C checks for collision at a position. This loop will run until C(x + x_velocity, y) returns 0 (no collision)
	WHILE C(X+S,Y)
		'To allow walking up sloped surfaces:
		IF !C(X+S,Y-2)*J>8 THEN Y=Y-2 BREAK
		
		'On each pass through the loop, the X velocity is decreased (and rounded towards 0)
		'>>0 is a short way to convert a number into an integer.
		S=S-SGN(S)>>0
		'Eventually, a valid position will be found, as long as the player wasn't already inside a wall. (In that case, the game freezes)
	WEND
	
	BGCLR '(Random BGCLR)
	'Add X velocity to X position
	X=X+S
	
	'To make jumping feel more fair, you are allowed to press the button a few frames before or after you're on the ground.
	'Without this system, you'll fail to jump if you press the button too early or right after walking off a ledge, which is annoying.
	
	'If J is greater than 0, the player is allowed to jump. J is set to 9 when the player collides during vertical movement.
	J=J-1
	'Every frame, J is decreased, so you can jump up to 9 (8?) (10?) (7?) frames after leaving the ground.
	
	B=BUTTON(2)
	'If K is not 0, the player will attempt to jump. When A (16) is pressed, K is set to 16.
	'Otherwise it's divided by 2 (and rounded down) each frame, reaching 0 after like 4 frames (I think).
	K=K/2 OR B AND 16
	'This means you can press the A button 4 frames before hitting the ground, and still jump successfully.
	
	'Y-AXIS MOVEMENT:
	'Loop runs until (x, y + y_velocity) is a valid position.
	WHILE C(X,Y+T)
		'Here, the animation counter is increased if the horizontal speed is high enough.
		A=(J>0)*A+(S*S>.05)
		'I'm... uh...
		'not really sure if this was actually supposed to be inside this loop...
		'... a-anyway, here A is multiplied by (J>0). This means that A is reset when J is <= 0 (which happens if the player is in the air)
		'So, the animation is reset when the player lands on the ground after falling, I guess...
		
		'When the player collides with anything during vertical movement, J is set to 9.
		J=9
		'Because it doesn't check what direction you're moving, you can jump after hitting a ceiling, not just while on the ground.
		'Originally that was a bug, but it turned out to be useful so I never fixed it.
		
		'Decrease velocity, same as X-AXIS loop:
		T=T-SGN(T)>>0
	WEND
	
	'If Y will be greater than 120, the level will scroll (by 1 pixel per frame).
	Z=Y+T>120
	'Add the Y velocity to Y, and subtract 1 if the level is going to scroll.
	Y=Y+T-Z
	
	'Position the player sprite. For some reason, the X position is rounded down while the Y position is rounded UP.
	SPOFS .,X,Y>>0
	'I have to manually round down the Y position, otherwise it will be wrong most of the time...
	
	'If K is not 0 and J is greater than 0, the player will jump.
	IF K*J>0 THEN T=-2.5 K=0 A=9 BEEP 9 J= Hey
	'This sets the Y velocity, sets the animation counter, resets both K and J, and plays a sound.
	'`Hey` is just an unused variable with a value of 0.
	'(This is at the end of a line, and I needed the line break to avoid an ENDIF. There wasn't anything else to do with those 3 extra characters)
	
	'This changes a sprite's definition to the character's death animation. (Facing the correct direction)
	SPCHR P!=2,C+17-SGN(S)
	'If the player is pressing DOWN on the d-pad (and no other buttons), P!=2 is 0, so it affects sprite 0 (the player sprite)
	'Otherwise it changes sprite 1, which is offscreen and you can't see it and it doesn't matter.
	
	'If the B button (32) is pressed and the number of pickaxes (W) is not 0, erase some pixels below the player
	IF !!W*B AND 32 THEN
		'This clears a roughly ellipse-shaped region
		GPUTCHR X-9,Y-9,"●",3,4,0
		
		'Create particle sprites: (6 of them)
		FOR I=0 TO 5
			'Using sprite definitions 3279 through 3282 with some repeats
			_=SPSET(3279+I*.7)
			'I wanted to just SPLINK these sprites to the player, but the player sprite is reset by SPSET every frame.
			SPOFS _,X,Y
			'Animate movement to a position within +=25 pixels
			SPANIM _,8,-30,RND(50)-25,RND(50)-25
			'Animate color change to transparent white. E-1 is the same as RGB(0,255,255,255). (See, I told you 1<<24 would be useful!)
			SPANIM _,6,-30,E-1
			'Fading to 0 (transparent black) will cause the sprites to darken, and I just want them to become transparent.
		NEXT
		'Those sprites are never actually deleted, so if you use enough pickaxes, the game will run out of sprites.
		'You'd have to use 85 pickaxes, though, which is definitely impossible. They spawn based on depth,
		'and the 8th would be located at 14*(2^85), which is 541598767187353870268366848 or something.
		
		BEEP 82
		'Subtract 1 from W. `FUZE` is another unused variable with a value of 0, so !FUZE is 1.
		W=W-! FUZE
	(ENDIF) '(in the original program, this was a single-line IF statement)
	
	'Draw a border around the screen so the player can't walk past the edge
	GBOX .,0,399,400
	
	'This behaves the same as IF Z THEN ... ENDIF, but is 1 character shorter
	'Code runs if the screen needs to scroll:
	ON Z GOTO @K
		'Scroll graphics up 1 pixel
		GCOPY 1,2,398,280,1,1,1
		'The old 3DS is just BARELY fast enough to do this in less than 1 frame. I had to make the scrolling area as small as possible
		'(as few offscreen tiles as possible) for it to work (which is why it became easy to fall offscreen before I fixed that)
		'It's so close that I couldn't even put the player sprite SPOFS after the GCOPY.
		
		'If the current depth (V) is greater than Q:
		ON V>Q GOTO @P
			'Create a pickaxe
			_=SPSET(112)
			SPOFS _,RND(384),V+262
			'I link all the pickaxes to sprite 1, so I can scroll them with the screen just by moving a single sprite.
			SPLINK _,1
			'Set the next pickaxe-spawn-depth to the current depth * 2
			Q=Q*2
			'Enable collision
			SPCOL _
		@P
		'Increase the depth
		V=V+1
		'Move the pickaxe linked sprite
		SPOFS 1,,-V
		
		'Draw the next row of tiles at the bottom of the screen. This should happen once every 14 pixels, so the rows don't overlap.
		' !(V MOD 14) is 0, except when the next row needs to be drawn.
		FOR I=1 TO !(V MOD 14)*29
			'Draw a random character (oh look, there's E again)
			GPUTCHR I*14-17,264,RND(E),2,(RND(10)<4)*2
			'I wanted 60% of the tiles to be empty, and the shortest way to skip a GPUTCHR is to set one of the scales to 0.
			'It's multiplied by (RND(10)<4), which is true 40% of the time.
		NEXT
	@K
	'Use the sprite sheet for BG tiles
	BGPAGE 4
	
	'Set the text background color to 1 (black).
	COLOR ,1
	'I never use CLS after this, to prevent the entire screen being covered by the text background color.
	
	'Display the number of pickaxes on the BG layer.
	BGFILL .,-1,0,W-1,0,111
	'The area to fill starts at -1 (instead of 0) since otherwise it'll always draw one tile even if W is 0.
	
	'Check for collision between the player sprite and pickaxe sprites
	H=SPHITSP(0)
	'If there was no collision, H will be -1, H+1 is 0, so it jumps to the 0th label in the list, @L, the start of the main loop
	ON H+1 GOTO @L
	'This just skips the last few lines if no collision was deteced
	
	'Remove the pickaxe sprite that was touched
	SPCLR(H)
	'I have no idea why I put parentheses there lol
	
	'Give player a pickaxe
	W=W+1
	'Sound
	BEEP 48
GOTO @L 'End of main loop

'Collision test function.
'Returns TRUE if the player will collide with anything at (X,Y)
DEF C(X,Y)
	DIM A[0]
	'Save the pixels that are inside the player's hitbox
	GSAVE X-3,Y-9,6,9,A,1
	
	
	RETURN 264<Y+MAX(A)
	'If there are no non-transparent pixels inside the player's hitbox, the function just returns Y>264.
	'But if there are, their color (most likely white (&HFFFF)) is added to Y, so it will always be greater than 264, and the function returns TRUE
END

Fans'(This will never be executed)
