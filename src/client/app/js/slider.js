function image_slider(slider_name, display_number, auto_play, play_delay, sliding_speed, display_arrows, display_dots){
	var a = this;
	a.slider_name = slider_name;
	a.display_number = display_number;
	a.auto_play = auto_play;
	a.play_delay = play_delay;
	a.sliding_speed = sliding_speed;
	a.display_arrows = display_arrows;
	a.display_dots = display_dots;
	a.$slider_items = $('.' + slider_name + ' .slider-item');
	a.width_whole = Math.ceil($('.' + slider_name + ' .display-wrapper').width());
	a.width_single = Math.ceil(
		a.$slider_items.width() 
		+ parseInt(a.$slider_items.css('padding-left')) 
		+ parseInt(a.$slider_items.css('padding-right')) 
		+ parseInt(a.$slider_items.css('border-left-width')) 
		+ parseInt(a.$slider_items.css('border-left-width')) 
		+ parseInt(a.$slider_items.css('border-right-width')));
	a.nunber_of_items = a.$slider_items.length;
	a.slide_active = false;
	a.counter = 0;
	a.select_object = [];
	a.auto_slider = [];
	a.gap = (a.width_whole - a.display_number * a.width_single) / (a.display_number + 1);

	this.reset_position = function(counter){
		if (a.nunber_of_items <= a.display_number) {
			a.counter = 0;
			for (var i = 0; i <= a.nunber_of_items; i++) {
				$(a.$slider_items[i]).animate({
					left: a.gap * (i - counter + 1)  + a.width_single * (i - counter),
				},0);
			}
		}else{
			for (var i = 0; i <= a.nunber_of_items; i++) {
				if (i < counter) {
					a.animate_object(a.$slider_items[i], - a.width_single, 0);
				}else if (i >= counter && i <= counter + a.display_number - 1) {
					a.animate_object(a.$slider_items[i], a.gap * (i - counter + 1)  + a.width_single * (i - counter), 0);
				}else if (i >= counter + a.display_number) {
					a.animate_object(a.$slider_items[i], '100%', 0);
				}
			}
			if (a.counter < 0) {
				for (var i = 0; i >  a.counter; i--) {
					a.animate_object(a.$slider_items[a.nunber_of_items + i - 1], a.gap * (-i + 1)  + a.width_single * (-i), 0);
				}
			}else if(a.counter > a.nunber_of_items - a.display_number){
				for (var i = 0; i < a.counter + a.display_number - a.nunber_of_items; i++) {
					a.animate_object(a.$slider_items[i], a.gap * (a.display_number - i)  + a.width_single * (a.display_number - i - 1), 0);
				}
			}
		}
	}

	this.horizontal_move = function(object, direction, sliding_speed, delay){
		if (a.slide_active) {
			return;
		}
		a.slide_active = true;

		$.each(object, function(i){
			setTimeout(function(){
				if ( $(a.$slider_items[a.select_object[i]]).position().left < 0 && direction == -1) {
					a.animate_object(a.$slider_items[a.select_object[i]], '100%', 0);
				}
				else if ( $(a.$slider_items[a.select_object[i]]).position().left >= a.width_whole - 1 && direction == 1) {
					a.animate_object(a.$slider_items[a.select_object[i]], - a.width_single, 0);
				}
				$(a.$slider_items[a.select_object[i]]).animate({
					left: "+=" + (a.gap + a.width_single) * direction,
				},sliding_speed, function(){
					a.slide_active = false;
				});
			},delay);
		});

		if (direction == -1) {
			a.counter++;
		}else if (direction == 1){
			a.counter--;
		}

		if (a.counter >= a.nunber_of_items) {
			a.counter = 0;
		}else if (a.counter == -a.display_number) {
			a.counter = a.nunber_of_items - a.display_number;
		}
		a.dot_active(a.counter);
	}

	this.click_arrow = function(sliding_speed, delay, direction){
		if (!a.slide_active && a.nunber_of_items > a.display_number) {
			a.select_object = [];

			if (direction == 'right') {
				for (var i = a.counter; i <= a.counter + a.display_number; i++) {
					if (i > a.nunber_of_items - 1) {
						a.select_object.push(i - a.nunber_of_items);
					}else if( i < 0){
						a.select_object.push(a.nunber_of_items + i);
					}else{
						a.select_object.push(i);
					}

				}
				a.horizontal_move(a.select_object, -1, sliding_speed, delay);

			}else{
				for (var i = a.counter - 1; i < a.counter + a.display_number; i++) {
				if (i < 0) {
					a.select_object.push(a.nunber_of_items + i);
				}else if( i >= a.nunber_of_items){
					a.select_object.push(i - a.nunber_of_items);
				}else{
					a.select_object.push(i);
				}
			}
			a.horizontal_move(a.select_object, 1, sliding_speed, delay);
			}
		}
	}

	this.start_auto_play = function(delay){
		a.auto_slider = setInterval(function(){
			a.click_arrow(a.sliding_speed, 0, 'right');
		}, delay);
	}

	this.stop_auto_play = function(){
		clearInterval(a.auto_slider);
	}

	this.little_dots = function(){
		if ($('.' + a.slider_name + ' .little-dot').length < a.nunber_of_items) {
			for (var i = 0; i < a.nunber_of_items  - 1; i++) {
				$('.' + a.slider_name + ' .little-dots').append('<span class="little-dot"></span>');
			}
		}
		if (a.nunber_of_items - 1  < 1 || !a.display_dots || a.nunber_of_items <= a.display_number) {
				$('.' + a.slider_name + ' .little-dots').addClass('hidden');
		}else{
			$('.' + a.slider_name + ' .little-dots').removeClass('hidden');
		}
		
	}

	this.dot_active = function(n){
		var $all_dots = $('.' + a.slider_name + ' .little-dot');
		$all_dots.removeClass('dot-active');
		if (n < 0) {
			n = a.nunber_of_items - 1;
		}
		if (a.counter >= 0) {
			$($all_dots[a.counter]).addClass('dot-active');
		}else{
			$($all_dots[a.nunber_of_items + a.counter]).addClass('dot-active');
		}

	}

	this.dot_click = function(){
		var $all_dots = $('.' + a.slider_name + ' .little-dot');
		$all_dots.on('click', function(){
			var the_dot_clicked = $(this).prevAll().length;
			var delay_counter = 0;
			var speed_adjust = 0;
			if (a.counter < the_dot_clicked) {
				speed_adjust = a.sliding_speed / 2 * ($all_dots.length - (the_dot_clicked - a.counter));
				for (var i = a.counter; i < the_dot_clicked; i++) {
					setTimeout(function(){
						a.click_arrow(speed_adjust, 0, 'right');
					}, (speed_adjust + 50) * delay_counter);
					delay_counter++;
				}
			}else if(a.counter > the_dot_clicked){
				speed_adjust = a.sliding_speed / 2 * ($all_dots.length + (the_dot_clicked - a.counter));
				for (var i = a.counter; i > the_dot_clicked; i--) {
					setTimeout(function(){
						a.click_arrow(speed_adjust, 0, 'left');
					}, (speed_adjust + 50) * delay_counter);
					delay_counter++;
				}
			}
		});
	}

	this.arrow_control = function(){
		if (!a.display_arrows || a.nunber_of_items <= a.display_number) {
			$('.' + a.slider_name + ' .right-button').addClass('hidden');
			$('.' + a.slider_name + ' .left-button').addClass('hidden');
		}else{
			$('.' + a.slider_name + ' .right-button').removeClass('hidden');
			$('.' + a.slider_name + ' .left-button').removeClass('hidden');
		}
	}

	this.update_value = function(new_display_number){
		a.width_whole = Math.ceil($('.' + slider_name + ' .display-wrapper').width());
		a.width_single = Math.ceil(
		a.$slider_items.width() 
			+ parseInt(a.$slider_items.css('padding-left')) 
			+ parseInt(a.$slider_items.css('padding-right')) 
			+ parseInt(a.$slider_items.css('border-left-width')) 
			+ parseInt(a.$slider_items.css('border-left-width')) 
			+ parseInt(a.$slider_items.css('border-right-width')));
		a.display_number = new_display_number;
		a.gap = (a.width_whole - a.display_number * a.width_single) / (a.display_number + 1);
		a.reset_position(a.counter);
		a.arrow_control();
		a.little_dots();
	}

	this.animate_object = function(obj, distance, delay){
		$(obj).animate({
			left: distance,
		},delay);
	}

	a.little_dots();
	a.dot_active(a.counter);
	a.dot_click();
	a.arrow_control();

	if (a.auto_play) {
		a.start_auto_play(a.play_delay);
		$('.' + a.slider_name).on({
			mouseover: function(){
				a.stop_auto_play();
			},
			mouseleave: function(){
				a.start_auto_play(a.play_delay);
			}
		});
	}
	$('.' + a.slider_name + ' .right-button').on('click', function(){
		a.click_arrow(a.sliding_speed, 0, 'right');
	});

	$('.' + a.slider_name + ' .left-button').on('click', function(){
		a.click_arrow(a.sliding_speed, 0, 'left');
	});
}





