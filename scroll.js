
$(document).scrollTop();
let cards=[];
function init(){
    for(let c of $(".card")){
        cards.push({w:$(c), left:$(c).position().left})
    }
    console.debug(cards)
    $(window).scroll(
        function(){
            let total = $("body").height()-$(window).height()
            let scroll = $(this).scrollTop()
            let p = scroll/total
            let pct = Math.round(p*100)
            $("#percent").html(pct+"%")
            let c0 = cards[0]
            total = $("#sidescroller").width()-c0.w.width()
            scroll = p*total;
            for (let c of cards){
                c.w.css({left:c0.left-scroll})
            }
    });
    $("#sidescroller")[0].scrollTo({x:200,y:0})

}
$('head').append('<link rel="stylesheet" type="text/css" href="sidescroll.css">');
$(init)
