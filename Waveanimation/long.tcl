set N 32
set adelay 10
set freq(1) 10
set freq(2) 10
set amp(1) 5
set amp(2) 5
set lam(1) 16
set lam(2) 16
set sh 1
set shy 30
set t 0
set tmax 100
set dt 0.01
set on(1) 1
set on(2) 1
set on(3) 0
set longQ 0
destroy .c .f .finput .ftime
canvas .c -bg #eee -height 600 -width [expr $N*14+100]
#------------------------------
frame .f -relief groove -bd 2
frame .finput -relief groove -bd 2
frame .ftime -relief groove -bd 2
frame .fpram(1) -relief groove -bd 2
frame .fpram(2) -relief groove -bd 2
frame .fon -relief groove -bd 2
pack .f .ftime .c .fpram(1) .fpram(2) .fon -side left -padx 1m -pady 1m
#------------------------------
button .f.run -text "Run" -command {Run $tmax}
button .f.stop -text "Stop" -command {set stop 1}
button .f.reset -text "Reset" -command {Reset}
pack .f.run .f.stop .f.reset -padx 1m -pady 1m
#------------------------------
label .ftime.head -text "Time"
entry .ftime.time -textvariable t -relief sunken -width 4
entry .ftime.tmax -textvariable tmax -relief sunken -width 4
entry .ftime.dt -textvariable dt -relief sunken -width 4
#entry .ftime.aa -textvariable Aa -width 4
#entry .ftime.ab -textvariable Ab -width 4
pack .ftime.head .ftime.time .ftime.tmax .ftime.dt -side top -padx 2m -pady 1m
#------------------------------
label .fpram(1).ampl -text "A"
entry .fpram(1).ampe -textvariable amp(1) -relief sunken -width 4 -font 24
label .fpram(1).laml -text "lam"
entry .fpram(1).lame -textvariable lam(1) -relief sunken -width 4 -font 24
label .fpram(1).freql -text "f"
entry .fpram(1).freqe -textvariable freq(1) -relief sunken -width 4 -font 24
pack .fpram(1).ampl .fpram(1).ampe .fpram(1).laml .fpram(1).lame .fpram(1).freql .fpram(1).freqe -side top -padx 1m -pady 1m
#------------------------------
label .fpram(2).ampl -text "A" -foreground red
entry .fpram(2).ampe -textvariable amp(2) -relief sunken -width 4 -font 24
label .fpram(2).laml -text "lam" -foreground red
entry .fpram(2).lame -textvariable lam(2) -relief sunken -width 4 -font 24
label .fpram(2).freql -text "f" -foreground red
entry .fpram(2).freqe -textvariable freq(2) -relief sunken -width 4 -font 24
pack .fpram(2).ampl .fpram(2).ampe .fpram(2).laml .fpram(2).lame .fpram(2).freql .fpram(2).freqe -side top -padx 1m -pady 1m
#------------------------------
label .fon.bxl(1) -text "Wave 1" -foreground black
checkbutton .fon.bxc(1) -variable on(1)
label .fon.bxl(2) -text "Wave 2" -foreground red
checkbutton .fon.bxc(2) -variable on(2)
label .fon.bxl(3) -text "Sum" -foreground blue
checkbutton .fon.bxc(3) -variable on(3)
label .fon.bovl -text "Separate"
checkbutton .fon.bovc -variable sh
label .fon.bll -text "Longitudinal"
checkbutton .fon.blc -variable longQ
pack .fon.bxl(1) .fon.bxc(1) .fon.bxl(2) .fon.bxc(2) .fon.bxl(3) .fon.bxc(3) .fon.bovl .fon.bovc -side top
pack .fon.bll .fon.blc -side top
#------------------------------
proc cox {x} {
    set r 6
    set dx [expr 10*$r]
    return [expr $x*2*$r+$dx]
}
proc coy {y} {
    set r 3
    set dy [expr 40*$r]
    return [expr $y*2*$r+$dy]
}

proc coord {x y} {
    set r 6
    return "[expr [cox $x]-0.8*$r] [expr [coy $y]-$r] [expr [cox $x]+0.8*$r] [expr [coy $y]+$r]"

}

proc Displacement {A f l x t} {
    set pi 3.14159
    if { $l != 0 } {
	set phase [expr $f*$t-$x/($l+0.0)]
    } else { set phase 0 }
    set result [expr $A*sin(2*$pi*$phase)]
    return $result
}

proc MoveDots {} {
    global N dot t on sh shy longQ
    global amp lam freq
    for {set i 0} {$i<=$N} {incr i} {
	set y(1) [Displacement $amp(1) $freq(1) $lam(1) $i $t]
	set y(2) [Displacement $amp(2) $freq(2) $lam(2) $i $t]
	if {$longQ==0} {
	    if {$on(1)} {.c coords $dot(0,$i) [coord $i $y(1)]}
	    if {$on(2)} {.c coords $dot(1,$i) [coord $i [expr $y(2)+$sh*$shy]]}
	    if {$on(3)} {.c coords $dot(2,$i) [coord $i [expr $y(1)+$y(2)+(1+$sh)*$shy]]}
	} else {
	    if {$on(1)} {.c coords $dot(0,$i) [coord [expr $i+$y(1)] 0]}
	    if {$on(2)} {.c coords $dot(1,$i) [coord [expr $i+$y(2)] [expr $sh*$shy]]}
	    if {$on(3)} {.c coords $dot(2,$i) [coord [expr $i+$y(1)+$y(2)] [expr (1+$sh)*$shy]]}
	}
    }
}

proc Reset {} {
    global t N dot sh shy
    set t 0
    MoveDots
    for {set i 0} {$i<=$N} {incr i} {
	for {set c 0} {$c<=2} {incr c} {
	    .c coords $dot($c,$i) [coord $i [expr $c*$sh*$shy]]
	}}
#puts "Reset"
}

.c create line [cox 0] [coy 0] [cox $N] [coy 0]
.c create line [cox 0] [coy [expr $shy*$sh]] [cox $N] [coy [expr $shy*$sh]]
.c create line [cox 0] [coy [expr $shy*$sh*2]] [cox $N] [coy [expr $shy*$sh*2]]
.c create line [cox [expr $N/2]] [coy -5] [cox [expr $N/2]] [coy [expr $shy*2+5]]


for {set i 0} {$i<=$N} {incr i} {
    set dot(0,$i) [.c create oval [coord $i 0] -fill black]
    set dot(1,$i) [.c create oval [coord $i [expr $shy*$sh]] -fill red]
    set dot(2,$i) [.c create oval [coord $i [expr $shy*$sh*2]] -fill blue]
}
.c itemconfigure $dot(0,16) -fill yellow
.c itemconfigure $dot(0,15) -fill green
.c itemconfigure $dot(1,16) -fill yellow
.c itemconfigure $dot(2,16) -fill yellow

Reset
proc IsNZ {s} {
    set dum [regexp {^[0-9.-]+$} $s]
    return $dum
}
proc Validate {} {
    global amp lam freq
    set ok [expr [IsNZ $amp(1)]*[IsNZ $amp(2)]*[IsNZ $lam(1)]*[IsNZ $lam(2)]*[IsNZ $freq(1)]*[IsNZ $freq(2)]]
    return $ok
}
proc Run {tmax} {
    global stop adelay t dt #Aa dot on sh amp freq lam
#    puts "$on(1) $on(2) $on(3) $sh"
    set stop 0
    if {$t>=$tmax} {set t 0}
    set t0 $t
#    .f.run configure -text "Stop" -command {set stop 1}
    for {} {$t<$tmax} {set t [expr $t+$dt]} {
	if {! [Validate] } { break }
	MoveDots
	after $adelay
	update
#	if {$amp(1)*$lam(1)*$freq(1)*$amp(2)*$lam(2)*$freq(2)==0} {set stop 1}
	if {$stop>0} {break}
    }
#    .f.run configure -text "Run" -command {Run $tmax}
}
	
