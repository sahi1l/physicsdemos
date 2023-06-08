foreach w [winfo children .] {destroy $w}
canvas .c -width 500 -height 400
entry .left -width 40 -textvariable left
entry .right -width 40 -textvariable right
button .reset -text "Reset" -command Reset
pack .c .left .right .reset -side top
.c create line 0 0 0 0 -tag sum -width 3 -fill black -dash {}
.c create line 0 0 0 0 -tag left -width 3 -fill red -dash -
.c create line 0 0 0 0 -tag right -width 3 -fill blue -dash -
.c create line 0 200 400 200 
set t 0
proc Value {x str {type 0}} {
    set type [lindex $str 0]
    set list [lrange $str 1 end]
    if $type==0 {
	return [SqValue $x $list]
    } else {
	return [TriValue $x $list]
    }
}
proc SqValue {x str} {
    set str [concat {0} $str {0}]
    if {$x<0 || $x>[llength $str]} {return 0}
    set I [expr int($x)]
    return [lindex $str $I]
}
proc TriValue {x str} {
    set str [concat {0} $str {0}]
    if {$x<0 || $x>[llength $str]} {return 0}
    set I [expr int($x)]
    set F [expr $x-int($x)]
    if abs($F)<0.01 {return [lindex $str $I]}
    set L [lindex $str $I]
    set R [lindex $str [expr $I+1]]
    return [expr $F*$R+(1-$F)*$L]
}
set type 0
proc DrawPulses {} {
    global left right t type
    set xscale 25
    set yscale 50
    set xL 25
    set xR 375
    set yZ 200
    set lcoo {}
    set rcoo {}
    set scoo {}
    for {set x 0} {$x<=16} {set x [expr $x+0.1]} {
	set LV [Value [expr $x-$t] $left $type]
	set RV [Value [expr (16-$x)-$t] $right $type]
	if {[llength $LV]*[llength $RV]} {
	    lappend lcoo [expr $xL+$xscale*$x]
	    lappend rcoo [expr $xL+$xscale*$x]
	    lappend scoo [expr $xL+$xscale*$x]
	    lappend scoo [expr $yZ-$yscale*($LV+$RV)]
	    lappend lcoo [expr $yZ-$yscale*$LV]
	    lappend rcoo [expr $yZ-$yscale*$RV]
	}
    }
    .c coords left $lcoo
    .c coords right $rcoo
    .c coords sum $scoo
    set t [expr $t+0.1]
}

set t 0
bind . <Escape> {DrawPulses}
proc Stop {} {
}
proc Reset {} {global t; set t 0;DrawPulses}
bind . <Command-q> {exit}
bind . <Control-q> {exit}
bind . <Return> {Reset}