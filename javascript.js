//  Settings  //
var maxFish = 100;
//  Settings  //

var fishTypes = [
["goldfish", 200, 300, 300000],
["neonfish", 400, 600, 600000],
["neonfish_2", 400, 600, 600000],
["neonfish_3", 400, 600, 600000],
["starfish", 500, 750, 900000],
["jellyfish", 500, 750, 900000],
["clownfish", 600, 1000, 1200000],
["bass", 2000, 2500, 1200000],
["marlin", 3000, 4000, 1500000],
["crownfish", 10000, 12000, 2000000]
];
var f_id = 0;
var coins = 500;
var showNames = false;

 jQuery.fn.doesExist = function(){
        return jQuery(this).length > 0;
 };

function updateCoins()
{
$("#coins").html(coins);
}

function startGrowth(f_id, place)
{
var growth = $("#growth_"+f_id);
var p_v = parseInt(place);
var speed = (fishTypes[p_v][3])/(100);
var growthP = growth.attr("data-growth");
var growthPn = parseInt(growthP.replace("%", ""));
var new_growthPn = growthPn+1;

if(growthPn==100)
{
growth.animate({"width": "100%"}, speed, function(){
});
return false;
}
else
{

 growth.animate({"width": growthPn+"%"}, speed, function(){

 growth.attr("data-growth", new_growthPn+"%");
 fishStats(f_id, place);
 startGrowth(f_id, place);
 });
 }
}

function fishStats(fish_id, place)
{
var fish = $("#fish_"+fish_id);
var growth = $("#growth_"+fish_id).attr("data-growth");
var p_v = parseInt(place);
if(growth=="100%"){var sellValue = fishTypes[p_v][2];var grownMsg = "(Fully Grown)";var grown=true;}
else{var sellValue = fishTypes[p_v][1];var grownMsg = "(Will sell for more when fully grown)";var grown=false;}
$("#stat_name").html(fish.attr("data-name"));
$("#stat_type").html(fish.attr("data-type"));
$("#stat_growth").html(growth+" "+grownMsg);

$("#sellFish").html("Sell for "+sellValue+" coins");
$("#sellFish").attr("data-sell", p_v);
$("#sellFish").attr("data-growth", grown);
$("#sellFish").attr("data-id", fish_id);
}

function sellFish()
{
var p_v = parseInt($("#sellFish").attr("data-sell"));
var isGrown = $("#sellFish").attr("data-grown");
var data_id = $("#sellFish").attr("data-id");

if(isGrown=="true")
{
var sellValue = fishTypes[p_v][2];
$("#fish_"+data_id).remove();
coins = coins+sellValue;
updateCoins();
closeMenu();
return false;
}
else
{
var sellValue = fishTypes[p_v][1];
$("#fish_"+data_id).remove();
coins = coins+sellValue;
updateCoins();
closeMenu();
return false;
}
}


function toggleNames()
{
closeMenu();
if(f_id==0)
{
alert("you don't have any fish anyway you dumbass");
return false;
}
if(showNames==false)
{
$(".fishName").show();
showNames=true;
return false;
}
if(showNames==true)
{
$(".fishName").hide();
showNames=false;
return false;
}
}


function addFish(type, place)
{
var price = fishTypes[place][1];

if(price>coins)
{
alert("Not enough coins!");
return false;
}

if(f_id==maxFish)
{
alert("Sorry, fish tank full!");
return false;
}
var fishName=prompt("Name your fish", "");

if (fishName!=null)
  {
  fishName = fishName.replace(/ /g,"_");
f_id++;
if(showNames==true)
{
$("#fish_tank").append('<div id="fish_'+f_id+'" data-place="'+place+'" data-name="'+fishName+'" data-id="'+f_id+'"  data-type="'+type+'" class="'+type+' fish"><center><div class="fishName">'+fishName+'</div></center></div>');
}
if(showNames==false)
{
$("#fish_tank").append('<div id="fish_'+f_id+'" data-place="'+place+'" data-name="'+fishName+'" data-id="'+f_id+'" data-type="'+type+'" class="'+type+' fish"><center><div class="fishName hidden">'+fishName+'</div></center></div>');
}

$("#fish_"+f_id).append("<div class='growth'><div id='growth_"+f_id+"' data-growth='0%' style='width:0%;' class='inner_growth'></div></div>").click(function(){
var id_f = $(this).attr("data-id");
var p_id = $(this).attr("data-place");
fishStats(id_f, p_id);
menu2('fishStats');
});

startGrowth(f_id, place);

fishStart(f_id, type);
closeMenu(true, f_id);
coins = coins-price;
updateCoins();
  }


}

function fishStart(fish_id, type) {
    var theDiv = $("#fish_"+fish_id),
        theContainer = $("#fish_tank"),
        maxLeft = theContainer.width() - theDiv.width(),
        maxTop = theContainer.height() - theDiv.height(),
        leftPos = Math.floor(Math.random() * maxLeft),
        topPos = Math.floor(Math.random() * maxTop);
		
		if(theDiv.doesExist()==true)
		{

    if (theDiv.position().left < leftPos) {
        theDiv.removeClass("left").addClass("right");
    } else {
        theDiv.removeClass("right").addClass("left");
    }
	var speed = ranDum(10000, 20000);

	theDiv.attr("data-speed", speed);
	
	theDiv.mouseover(function(){
	if(showNames==false){
	$("#fish_"+fish_id+" .fishName").show();
	}
	});
	
	theDiv.mouseout(function(){
	if(showNames==false){
	$("#fish_"+fish_id+" .fishName").hide();
	}
	});

	
    theDiv.animate({
        "left": leftPos,
        "top": topPos
    }, speed, function(){
	fishStart(fish_id, type);
	});
	
	}
	
}


function ranDum(from,to)
{
    return Math.floor(Math.random()*(to-from+1)+from);
}

function menu2(what)
{
$(".close").fadeIn("fast");
$("#menu_overlay .hidden").hide();
$("#"+what).fadeIn("fast");
}

function menu(what)
{
if($("#"+what).css("display")=="block")
{
closeMenu();
}
else
{
$(".close").fadeIn("fast");
$("#menu_overlay .hidden").hide();
$("#"+what).fadeIn("fast");
}

}

function closeMenu(newFish, fish_id)
{
$(".close").fadeOut("fast");
$("#menu_overlay .hidden").fadeOut("fast", function(){
if(newFish==true)
{
var fishDiv = $("#fish_"+fish_id);

fishDiv.css("border", "");
setTimeout(function(){
fishDiv.css("border", "");
},5000);
}
});
}

$(function(){
updateCoins();
for (i=0;i<fishTypes.length;i++)
  {
  $("#fishSelect").append('<li title="'+fishTypes[i][0]+'" class="fishSelect" onclick="addFish('+"'"+fishTypes[i][0]+"'"+', '+i+');"><div style="display:inline-block;" class="'+fishTypes[i][0]+' left"></div></li>');
  }
});
