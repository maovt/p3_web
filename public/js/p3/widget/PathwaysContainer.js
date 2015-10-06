define([
	"dojo/_base/declare", "dijit/layout/BorderContainer", "dojo/on","dojo/_base/lang",
	"./ActionBar", "./ContainerActionBar", "dijit/layout/StackContainer", "dijit/layout/TabController",
	"./PathwaysGridContainer", "dijit/layout/ContentPane","./GridContainer","dijit/TooltipDialog",
	"./ItemDetailPanel","dojo/topic","dijit/form/ToggleButton"
], function(declare, BorderContainer, on, lang,
			ActionBar, ContainerActionBar, TabContainer,StackController,
			PathwaysGrid, ContentPane, GridContainer,TooltipDialog,
			ItemDetailPanel,Topic,TabButton
) {


	var vfc = '<div class="wsActionTooltip" rel="dna">View FASTA DNA</div><div class="wsActionTooltip" rel="protein">View FASTA Proteins</div><hr><div class="wsActionTooltip" rel="dna">Download FASTA DNA</div><div class="wsActionTooltip" rel="downloaddna">Download FASTA DNA</div><div class="wsActionTooltip" rel="downloadprotein"> '
	var viewFASTATT=  new TooltipDialog({content: vfc, onMouseLeave: function(){ popup.close(viewFASTATT); }})

	var dfc = '<div>Download Table As...</div><div class="wsActionTooltip" rel="text/tsv">Text</div><div class="wsActionTooltip" rel="text/csv">CSV</div><div class="wsActionTooltip" rel="application/vnd.openxmlformats">Excel</div>'
	var downloadTT=  new TooltipDialog({content: dfc, onMouseLeave: function(){ popup.close(downloadTT); }})

	on(downloadTT.domNode, "div:click", function(evt){
		var rel = evt.target.attributes.rel.value;
		console.log("REL: ", rel);
		var selection = self.actionPanel.get('selection')
		var dataType=(self.actionPanel.currentContainerWidget.containerType=="genome_group")?"genome":"genome_feature"
		var currentQuery = self.actionPanel.currentContainerWidget.get('query');
		console.log("selection: ", selection);
		console.log("DownloadQuery: ", dataType, currentQuery );
		window.open("/api/" + dataType + "/" + currentQuery + "&http_authorization=" + encodeURIComponent(window.App.authorizationToken) + "&http_accept=" + rel + "&http_download");		
		popup.close(downloadTT);
	});

	return declare([BorderContainer], {
		gutters: false,
		params: null,
		//query: null,
		//_setQueryAttr: function(query){
		//	this.query = query;
		//	if (this.pathwaysGrid) {
		//		this.pathwaysGrid.set("query", query);
		//	}
		//},
		_setParamsAttr: function(params) {
			this.params = params;
			if(this._started && this.pathwaysGrid){
				var q = [];
				if(params.genome_id != null) q.push('genome_id:' + params.genome_id);
				if(params.annotation != null) q.push('annotation:' + params.annotation);
				if(params.pathway_id != null) q.push('pathway_id:' + prarms.pathway_id);


				this.pathwaysGrid.set("params", params);

				/*
				//console.log(params, q);
				this.pathwaysGrid.set("query", {
					q: q.join(' AND '),
					rows: 1,
					facet: true,
					'json.facet': '{stat:{field:{field:pathway_id,limit:-1,facet:{genome_count:"unique(genome_id)",gene_count:"unique(feature_id)",ec_count:"unique(ec_number)",genome_ec:"unique(genome_ec)"}}}}'
				});
				*/
			}
		},

		visible: false,
		_setVisibleAttr: function(visible){
			this.visible = visible;
			if (this.visible && this.getFilterPanel){
				var fp = this.getFilterPanel();
				if (fp){
					Topic.publish("/overlay/left", {action: "set", panel: fp});
					return;
				}
			}
			
			Topic.publish("/overlay/left", {action: "hide"});
			
		},

		startup: function() {
			console.log("**************** *************** PathwaysContainer startup()")
			if(this._started){
				return;
			}

			this.tabContainer = new TabContainer({region: "center", id: this.id + "_TabContainer"});
			var tabController = new StackController({containerId: this.id + "_TabContainer", region: "top", "class": "TextTabButtons"})

			this.pathwaysGrid = new PathwaysGrid({title: "Pathways", content: "Pathways Grid",params:this.params,query:{}});
			if (this.params){
				this.set("params",this.params);
			}
			this.ecNumbersGrid = new ContentPane({title: "EC Numbers", content: "EC Numbers Grid"});
			this.genesGrid = new ContentPane({title: "Genes", content: "Genes Grid"});

			this.addChild(tabController);
			this.addChild(this.tabContainer);
			this.tabContainer.addChild(this.pathwaysGrid);
			this.tabContainer.addChild(this.ecNumbersGrid);
			this.tabContainer.addChild(this.genesGrid);

			this.inherited(arguments);
		}
	});
});
