$( "#equalbtn" ).click(function() {
	// Close canvas-plot when request new calculation
	$("#console-error").css("display", "none");
	$("#console-input").css("display", "none");
	$("#console-result").css("display", "none");
	$("#console-expanded").css("display", "none");
	$("#console-roots").css("display", "none");
	$("#console-derivative").css("display", "none");
	$("#content-plot").css("display", "none");
	$("#value-derivative-step").css("display", "none");
	$("#canvas-plot").css("display", "none");
	// Start the parser
	var str = $("#textinpt").val();
	try
	{
		initparser(parse(str));
		$("#content-plot").css("display", "block");
		$("#console-input").css("display", "block");
		$("#console-result").css("display", "block");
		$("#console-derivative").css("display", "block");
	}
	catch(err)
	{
		$("#value-error").text(err);
		$("#console-error").css("display", "block");
	}
	// Show console and content-plot
	$("#console").css("display", "block");

});

$( "#derivative-step-btn" ).click(function() {
	$("#value-derivative-step").css("display", "block");
});

$( "#header-plot" ).click(function() {
	if($( "#canvas-plot" ).css("display") == "none"){
		if($.isNumeric(plot_value))
			plot_value = plot_value.toString();
		var instance = functionPlot({
			  target: '#canvas-plot',
			  disableZoom: true,
			  width: 300,
			  height: 200,
			  yAxis: {domain: [-1.5, 1.5]},
			  xAxis: {domain: [-6.28, 6.28]},
			  data: [{
			    fn: plot_value
			  }]
			})
	 	$( "#canvas-plot" ).slideDown( 1000, function() {
    		$( this ).focus();
    	});
	}else{
		$( "#canvas-plot" ).slideUp( 1000, function() {
			$( this ).css("display", "none");
    	});
	}
});

// Global var for the function plot
var plot_value;

function initparser( node )
{
  console.log(node);
  var func = stringEquation( node );
  var diff = symbolic_diff( node );

  var BAE_node = BAE_transform(node);
  var simplified = automatic_simplify(node);

	// algorithm to find roots (in development)
	var expanded = automatic_simplify(algebraic_expand(simplified));
	if(compare(expanded, simplified) != 0)
	{
		$("#value-expanded").html("<p>$$"+toTex(expanded)+"$$</p>");
		$("#console-expanded").css("display", "block");
	}

	var roots = solve_polynomial(expanded);

	if(roots.length)
	{
		var text = "";
		for(var root of roots)
		{
			if(root.type == 1)
			{
				text += "<p>$$x≈"+toTex(root.children)+"$$</p>";
			}
			else {
				text += "<p>$$x="+toTex(root)+"$$</p>";
			}
		}
		$("#value-roots").html(text);
		$("#console-roots").css("display", "block");
	}

  //[ "+toTex(construct(OP_MUL, simplified))+"]
	$("#value-input").html("<p>$$"+toTex(BAE_node)+"$$</p>");
	$("#value-result").html("<p>$$"+toTex(simplified)+"$$</p>");
	$("#value-derivative").html("<p>$$d/{dx}("+toTex(simplified)+")="+toTex(automatic_simplify(symbolic_diff(simplified)))+"$$</p>");
	$("#value-derivative-step").html("<p>"+step_diff(simplified)+"</p>");
  //$("#value-derivative").html("<p>$$d/{dx}("+toTex(BAE_node)+") -> "+toTex( simplified )+" -> "+toTex(symbolic_diff(simplified))+" -> "+toTex(automatic_simplify(symbolic_diff(simplified)))+" $$</p><br><br>"+step_diff(simplified)+"<br><br>"+toTex( BAE_node )+"<br>"+stringEquation( BAE_node )+"<br>"+toTex( simplified )+"<br>"+stringEquation(simplified));
  // Set the global plot value as the strin equation of the differentiation (it is necessary to fix some functios as sec, cot..)
  plot_value = stringEquation(diff);
  M.trustHtml = true;
  M.parseMath(document.getElementById("console"));
}
