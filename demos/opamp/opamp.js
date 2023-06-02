function get(label){
    return parseFloat($("#"+label).val())
}
function set(label,val){
    $("#"+label).val(val)
}
var handle;
var feedback=false;
function timestep(){
    var inc=1;
    var out=get("vout");
    if(get("vinp")>get("vinn")){
        if(out<get("vpp")){
            set("vout",out+inc);
            $("#vout").removeClass("max");
            $("#vout").removeClass("min");
        } else {
            set("vout",get("vpp"));
            $("#vout").addClass("max");
        }
    } else if (get("vinp")<get("vinn")){
        if(out>get("vpn")){
            set("vout",out-inc);
            $("#vout").removeClass("max");
            $("#vout").removeClass("min");
        } else {
            set("vout",get("vpn"));
            $("#vout").addClass("min");

        }
    }
    if(feedback){
        set("vinn",get("vout"));
    }
    handle=setTimeout(timestep,$("#interval").val());
}

function toggleFeedback(onQ){
    if(onQ==undefined){feedback=!feedback;} else {feedback=onQ;}
    if(feedback){
        $("#main").removeClass("nofeedback").addClass("feedback");
    } else {
        $("#main").removeClass("feedback").addClass("nofeedback");
    }
}
init=function(){
    $("#feedback").click(function(){
        toggleFeedback(this.checked);
    });
    timestep();
}
function stop(){clearTimeout(handle);}
$(init); //init
