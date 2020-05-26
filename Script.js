var cApath = Qva.Remote + "?public=only&type=Document&name=Extensions/popup_listbox/";
Qva.LoadCSS(cApath + "mystyle.css");

var preselected_values = [];
var checked_values = [];
var dimension_name = null;


Qva.AddDocumentExtension('popup_listbox', function() {	
		
		var _this = this;
		
		var listbox_toggler = 0;

		function popup_listbox_read(){
			
			
			//alert(this.Data.HeaderRows);
			//alert(this.Layout.Caption.label);
			
			if(listbox_toggler == 1){ 
				
				this.callbackFn = null;
			
				var html = "";
				var rows = this.Data.Rows;
				
				var n_columns = 5; // do not set to 0 :)
				var n_rows = Math.ceil(rows.length / n_columns); 
				var n_tail = n_columns - (n_columns * n_rows - rows.length);
				
				var col_div_closed = 1;
				var n_created_col = 0;
					
				
				html = html + '<div id="filter_popup"> <form id="filter_popup_form"><div id="form_content">'; 
				for (var r = 0, max = rows.length; r < max; r++) {
					var row = rows[r];
					if (row == null) continue;
					row = row[0];
						
					if (row.state == 'Selected'){
						preselected_values.push(row.text);
					}
							
					if(col_div_closed == 1){
						html += '<div class = "column">';
						col_div_closed = 0;
					}
					html += '<label class="container">';
					//alert("f"+row.text+"f");
					html += '<input class = "popup_options" type="checkbox" name="hd" value="'+ row.text +'" '+ (row.state == 'Selected' ? "checked" : ""  )+'>';
					html += '<span class="checkmark"></span>';
					html += (row.text.trim()=='' ? "!empty value!" : row.text) + '</label>'; // handle empty values ('') from listbox

					if(r%n_rows == n_rows-1 && n_created_col < n_tail){
						html += '</div>';
						col_div_closed = 1;
						n_created_col += 1;
					} else if ((r-n_created_col)%(n_rows-1) == n_rows - 2 && n_created_col >= n_tail){
						html += '</div>';
						col_div_closed = 1;
					}

				}
				
				html= html +'</div><br>';
				html= html +'<input id="filter_popup_button" class = "button button2" type="button" value="Submit">';
				html= html +'</form></div>';
				$("#MainContainer").append(html);
				
				$(document).on('click touchend', '#filter_popup_button', handleForm);
				
			} 		
		}
		
		
		function handleForm(){
			
			$(document).off('click touchend', '#filter_popup_button');
			listbox_toggler = 0;
			
			
			checked_values = $("input:checkbox[name=hd]:checked").map(function(){return $(this).val()}).get();
			
			var popup = document.getElementById("filter_popup");
			popup.outerHTML = "";
			
			//if changes are not made in checkboxes, then just ignore part with applying selections
			if (checked_values.length === preselected_values.length && checked_values.sort().every(function(value, index) { return value === preselected_values.sort()[index]})){
				return;
			}

			preselected_values = [];

			var values_list = '("'+checked_values.join('"|"')+'")'; // formated for multiple selection in QV
			
			_this.Document.SetVariable("popup_dimension", dimension_name);
			_this.Document.SetVariable("popup_values", values_list);
					
			checked_values = [];	
			dimension_name = null;
		}
		
		
		$(document).on('click touchend', '.popup', function() {
			
			if(listbox_toggler == 0){
				
				listbox_toggler = 1;
				
				// Button QV id format: '<ID>_<LB_ID>_<Dim_name> popup'   ->  Button HTML class format: 'QvFrame Document_<ID>_<LB_ID>_<Dim_name> popup'
				
				var listbox_id = this.className.split(' ')[1].split('_')[2];
				dimension_name = this.className.split(' ')[1].split('_')[3];				
				
				var lb =  _this.Document.GetObject(listbox_id);
				lb.callbackFn = popup_listbox_read;
			}
			else{
				preselected_values = [];
				listbox_toggler = 0;
				document.getElementById("filter_popup").outerHTML = ""; //TODO use jquery for consistency?
				$(document).off('click touchend', '#filter_popup_button');
				checked_values = [];
				
			}
			
		});
});


