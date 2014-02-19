window.canvas_crop = function(img, threshold){
	if(!(img instanceof HTMLImageElement)){
		alert('not an image element');
		return;
	}
	if(img.width < 40 || img.height < 40){
		alert('Very small image, no need to crop');
		return;
	}
	if(!threshold)
		var threshold = 20;
	
	var isTouch = 'ontouchstart' in window;
	var crop_wrap = document.createElement('div');
	var crop_rect = document.createElement('div');
	var crop_inner = document.createElement('div');
	var crop_canvas = document.createElement('canvas');
	crop_canvas.className = 'pcrop_canvas';
	crop_canvas.width = img.width;
	crop_canvas.height = img.height;

	crop_wrap.style.position = 'absolute';
	crop_rect.style.position = 'relative';
	crop_inner.style.position = 'absolute';
	
	crop_rect.style.boxSizing = crop_wrap.style.boxSizing = 'border-box';
	crop_rect.style.webkitBoxSizing = crop_wrap.style.webkitBoxSizing = 'border-box';
	crop_rect.style.MozBoxSizing = crop_wrap.style.MozBoxSizing = 'border-box';
	
	var img_bounds = cropimg.getBoundingClientRect();
	crop_wrap.style.height = img.height + "px";
	crop_wrap.style.width = img.width + "px";
	crop_wrap.style.top = (img.offsetTop + (img_bounds.height - img.height)/2) + "px";
	crop_wrap.style.left = (img.offsetLeft + (img_bounds.width - img.width)/2) + "px";
	crop_wrap.style.borderColor = "rgba(0,0,0,0.4)";
	crop_wrap.style.borderStyle = "solid";
	crop_wrap.style.borderLeftWidth = crop_wrap.style.borderRightWidth = img.width/4 + "px";
	crop_wrap.style.borderTopWidth = crop_wrap.style.borderBottomWidth = img.height/4 + "px";
	crop_wrap.style.zIndex = 1;
	crop_inner.style.top = threshold + "px";
	crop_inner.style.left = threshold + "px";
	crop_inner.style.right = threshold + "px";
	crop_inner.style.bottom = threshold + "px";

	crop_rect.style.width = "100%";
	crop_rect.style.height = "100%";
	crop_rect.style.border = "2px dotted #f9f9f9";
	crop_inner.style.cursor = 'move';

	img.parentNode.appendChild(crop_wrap);
	//img.parentNode.appendChild(crop_canvas);
	crop_wrap.appendChild(crop_rect);
	crop_rect.appendChild(crop_inner);

	function mouse_down(e){
		if(e.targetTouches && e.targetTouches.length)
			e = e.targetTouches[0]
		var wrap_bounds = crop_wrap.getBoundingClientRect();
		var rect_bounds = crop_rect.getBoundingClientRect();
		var initialBorderLeftWidth = rect_bounds.left - wrap_bounds.left;
		var initialBorderRightWidth = wrap_bounds.right - rect_bounds.right;
		var initialBorderTopWidth = rect_bounds.top - wrap_bounds.top;
		var initialBorderBottomWidth = wrap_bounds.bottom - rect_bounds.bottom;
		
		var shouldMove = (e.target == crop_inner);
		var mouse_move = function(f){
			if(f.targetTouches && f.targetTouches.length)
				f = f.targetTouches[0]
			var x_delta = e.pageX - f.pageX;
			var y_delta = e.pageY - f.pageY;
			var left_w = initialBorderLeftWidth - x_delta;
			var right_w = initialBorderRightWidth + x_delta;
			var top_w = initialBorderTopWidth - y_delta;
			var bot_w = initialBorderBottomWidth + y_delta;
			
			if(left_w < 0)left_w = 0;
			if(right_w < 0)right_w = 0;
			if(top_w < 0)top_w = 0;
			if(bot_w < 0)bot_w = 0;
			
			if(shouldMove){
				var max_w = wrap_bounds.width - rect_bounds.width;
				var max_h = wrap_bounds.height - rect_bounds.height;
				if(left_w > max_w)
					left_w = max_w;
				if(right_w > max_w)
					right_w = max_w;
				if(top_w > max_h)
					top_w = max_h;
				if(bot_w > max_h)
					bot_w = max_h;
				crop_wrap.style.borderLeftWidth = left_w + "px";
				crop_wrap.style.borderRightWidth = right_w + "px";
				crop_wrap.style.borderTopWidth = top_w + "px";
				crop_wrap.style.borderBottomWidth = bot_w + "px";
			} else {
				var offsetX = e.offsetX || e.pageX - rect_bounds.left;
				var offsetY = e.offsetY || e.pageY - rect_bounds.top;
				if(offsetX < threshold){
					if(rect_bounds.width + x_delta < 2 * threshold){
						left_w = wrap_bounds.width - initialBorderRightWidth - 2 * threshold;
					}
					crop_wrap.style.borderLeftWidth = left_w + "px";
				}
				else if(offsetX > rect_bounds.width - threshold){
					if(rect_bounds.width - x_delta < 2 * threshold){
						right_w = wrap_bounds.width - initialBorderLeftWidth - 2 * threshold;
					}
					crop_wrap.style.borderRightWidth = right_w + "px";
				}
				if(offsetY < threshold){
					if(rect_bounds.height + y_delta < 2 * threshold){
						top_w = wrap_bounds.height - initialBorderBottomWidth - 2 * threshold;
					}
					crop_wrap.style.borderTopWidth = top_w + "px";
				}
				else if(offsetY > rect_bounds.height - threshold){
					if(rect_bounds.height - y_delta < 2 * threshold){
						bot_w = wrap_bounds.height - initialBorderTopWidth - 2 * threshold;
					}
					crop_wrap.style.borderBottomWidth = bot_w + "px";
				}
			}
		}
		isTouch && document.addEventListener('touchmove', mouse_move);
		var mouse_up = function(){
			document.removeEventListener('mousemove', mouse_move);
			document.removeEventListener('mouseup', mouse_up);
		}
		document.addEventListener('mousemove', mouse_move);
		document.addEventListener('mouseup', mouse_up);
		if(isTouch){
			var touch_end = function(){
				document.removeEventListener('touchmove', mouse_move);
				document.removeEventListener('touchend', touch_end);
			}
			document.addEventListener('touchend',touch_end)
		}
	}
	function cropToCanvas(){
		var wrap_bounds = crop_wrap.getBoundingClientRect();
		var rect_bounds = crop_rect.getBoundingClientRect();
		var left_w = rect_bounds.left - wrap_bounds.left;
		var right_w = wrap_bounds.right - rect_bounds.right;
		var top_w = rect_bounds.top - wrap_bounds.top;
		var bot_w = wrap_bounds.bottom - rect_bounds.bottom;
		
		var wratio = img.naturalWidth/img.width;
		var hratio = img.naturalHeight/img.height;
		
		var w = crop_wrap.offsetWidth - left_w - right_w;
		var h = crop_wrap.offsetHeight - top_w - bot_w;
		
		crop_canvas.width = w;
		crop_canvas.height = h;
		crop_canvas.getContext('2d').clearRect(0,0,crop_canvas.width,crop_canvas.height)
		crop_canvas.getContext('2d').drawImage(
			img,
			wratio*left_w,
			hratio*top_w,
			wratio*(w),
			hratio*(h),
			0,
			0,
			w,
			h
		)
	}
	function crop_destroy(){
		crop_rect.removeEventListener('mousedown', mouse_down);
		isTouch && crop_rect.removeEventListener('touchstart', mouse_down);
		if(crop_wrap.parentNode)
			crop_wrap.parentNode.removeChild(crop_wrap);
	}
	crop_rect.addEventListener('mousedown', mouse_down);
	isTouch && crop_rect.addEventListener('touchstart', mouse_down);
	
	return {
		cropToCanvas : cropToCanvas,
		destroy : crop_destroy,
		canvasEl : crop_canvas,
		cropEl : crop_wrap,
		cropRect : crop_rect,
		cropInner : crop_inner
	}
}