var count=[];
var nm=0;
function Neo(urlSource) {
	count=[];
	nm=0;
	function txUrl() {
		var connection = urlSource();
		var url = (connection.url).replace(/\/db\/data.*/,"");
		return url + "/db/data/transaction/commit";
	} 
	var me = {
		executeQuery: function(query, params, cb) {
			var connection = urlSource();
			var auth = "Basic " + btoa(connection.user + ":" + connection.pass);
			$.ajax(txUrl(), {//异步http请求
				type: "POST",
				data: JSON.stringify({
					statements: [{
						statement: query,
						parameters: params || {},
						resultDataContents: ["row", "graph"]
					}]
				}),
				contentType: "application/json",
				error: function(err) {
					cb(err);
				},
				beforeSend: function (xhr) {
				    if (auth && auth.length) xhr.setRequestHeader ("Authorization", auth);
				},
				success: function(res) {
					if (res.errors.length > 0) {
						cb(res.errors);
					} else {
						var cols = res.results[0].columns;
						//console.log(res);//results errors
						//console.log(cols);//r
						var rows = res.results[0].data.map(function(row) {
							//grapg meta row
							var r = {};
							cols.forEach(function(col, index) {
								r[col] = row.row[index];
							});
							//console.log(r.p.length);
						  // console.log(r.p[1].count);
							if(r.p.length==3)
							{
								count[nm]=r.p[1].count;
								nm++;
							}
							else if(r.p.length==5)
							{
								count[nm]=r.p[1].count;
								nm++;
								count[nm]=r.p[3].count;
								nm++;
							}
							return r;
							
						});
						var nodes = [];
						var rels = [];
						var labels = [];
					    function findNode(nodes, id) {
						   for (var i=0;i<nodes.length;i++) {
						      if (nodes[i].id == id) return i;
						   }
						   return -1;
					    }
						res.results[0].data.forEach(function(row) {
							row.graph.nodes.forEach(function(n) {
							   var found = nodes.filter(function (m) { return m.id == n.id; }).length > 0;
							   if (!found) {
								  //n.props=n.properties;
								  for(var p in n.properties||{}) { n[p]=n.properties[p];delete n.properties[p];} 
								  delete n.properties;
								  nodes.push(n);
								  labels=labels.concat(n.labels.filter(function(l) { labels.indexOf(l) == -1 }))
							   }
							});
							rels = rels.concat(row.graph.relationships.map(
								function(r) { 
								   return { id: r.id, start:r.startNode, end:r.endNode, type:r.type } }
								));
						});
						cb(null,{table:rows,graph:{nodes:nodes, links:rels},labels:labels});
					}
				}
			});
		}
	};
	return me;
}
