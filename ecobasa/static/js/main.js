(function( $ ){
	$.ecobasa = {
		fullcalendar : function() {
			// There are two kinds of calendar in cosinnus: big and small.
			// The .big-calendar fills the content and shows events.
			// Users can add events here.
			// The .small-calendar is for tooltips or small static date chooser.
			// both are based on jQuery fullcalendar. http://arshaw.com/fullcalendar/

			var localeSettings = {
				de: {
					firstDay: 1, // Monday
					buttonText: {
						today: "Heute",
						month: "Monat",
						week: "Woche",
						day: "Tag"
					},
					monthNames: ['Januar','Februar','März','April',
						'Mai','Juni','Juli','August',
						'September','Oktober','November','Dezember'],
					monthNamesShort: ['Jan','Feb','Mär','Apr','Mai',
						'Jun','Jul','Aug','Sept','Okt','Nov','Dez'],
					dayNames: ['Sonntag','Montag','Dienstag',
						'Mittwoch','Donnerstag','Freitag','Samstag'],
					dayNamesShort: ['So','Mo','Di','Mi','Do','Fr','Sa'],
					titleFormat: {
						month: 'MMMM yyyy',
						week: "d.[ MMMM][ yyyy]{ - d. MMMM yyyy}",
						day: 'dddd d. MMMM yyyy'
					},
					columnFormat: {
						month: 'ddd',
						week: 'ddd d',
						day: ''
					},
					axisFormat: 'H:mm', 
					timeFormat: {
						'': 'H:mm', 
						agenda: 'H:mm{ - H:mm}'
					}
				}
			};
			// LanguageCode injected by backend
			var currentLocaleSettings = localeSettings[LanguageCode];

			if ($('.big-calendar').length)
			$('.big-calendar').fullCalendar($.extend({
				header: {
					left: 'prev,next today',
					center: 'title',
					right: 'month,agendaWeek,agendaDay' // basicDay
				},
				defaultView: 'agendaWeek',

				// cosinnus_calendarEvents is a global var containing the events
				// set by the backend somewhere in the BODY.
				events: cosinnus_calendarEvents,
				select: function(startDate, endDate, allDay, jsEvent, view) {
					$(this.element)
						.closest('.big-calendar')
						.trigger('fullCalendarSelect',[startDate, endDate, allDay, jsEvent, view]);
				},
				eventClick: function(event, jsEvent, view) {
					$(this)
						.closest('.big-calendar')
						.trigger('fullCalendarEventClick',[event, jsEvent, view]);
				},
				selectable: true,
				selectHelper: true
			}, currentLocaleSettings));

			if ($('.small-calendar').length)
			$('.small-calendar').fullCalendar($.extend({
				header: {
					left: 'prev',
					center: 'title',
					right: 'next'
				},
				dayClick: function(date, allDay, jsEvent, view) {
					$(this).trigger('fullCalendarDayClick',[date,jsEvent]);
				},
				viewRender: function(date, cell) {
					// A day has to be rendered because of redraw or something
					$(cell).closest('.small-calendar').trigger('fullCalendarViewRender',[cell]);
				}

			}, currentLocaleSettings));
		},


		calendarBig : function() {
			// The big calendar fills the whole content area and contains the user's events.

			$('.big-calendar')
				.on("fullCalendarSelect", function(event, startDate, endDate, allDay, jsEvent, view) {
					// Dates have been selected. Now the user might want to add an event.
					var startDateDataAttr = startDate.getFullYear() + "-"
						+ ((startDate.getMonth()+1).toString().length === 2
							? (startDate.getMonth()+1)
							: "0" + (startDate.getMonth()+1)) + "-"
						+ (startDate.getDate().toString().length === 2
							? startDate.getDate()
							: "0" + startDate.getDate());

					var endDateDataAttr = endDate.getFullYear() + "-"
						+ ((endDate.getMonth()+1).toString().length === 2
							? (endDate.getMonth()+1)
							: "0" + (endDate.getMonth()+1)) + "-"
						+ (endDate.getDate().toString().length === 2
							? endDate.getDate()
							: "0" + endDate.getDate());

					// allDay is always true as times can not be selected.


					$('#calendarConfirmStartDate').val(startDateDataAttr);
					$('#calendarConfirmEndDate').val(endDateDataAttr);

					if (startDateDataAttr == endDateDataAttr) {
						// Event has one day
						$('#calendarConfirmEventOneday').show();
						$('#calendarConfirmEventMultiday').hide();

						moment.lang(moment.lang(),$.cosinnus.momentShort[moment.lang()]);
						eventDate = moment(startDateDataAttr);
						var eventDate = moment(eventDate).calendar();
						$('#calendarConfirmEventDate').text(eventDate);

						$('#confirmEventModal').modal('show');
					} else {
						// Event has multiple days
						$('#calendarConfirmEventOneday').hide();
						$('#calendarConfirmEventMultiday').show();

						// There is no time, so use momentShort.
						moment.lang(moment.lang(),$.cosinnus.momentShort[moment.lang()]);
						startDate = moment(startDateDataAttr);
						var startDate = moment(startDate).calendar();
						$('#calendarConfirmEventStart').text(startDate);

						endDate = moment(endDateDataAttr);
						var endDate = moment(endDate).calendar();
						$('#calendarConfirmEventEnd').text(endDate);

						$('#confirmEventModal').modal('show');
					}
			});

		},

		// When creating or editing an event the user has to select date and time.
		// Clicking one date input shows all calendars on the whole page.
		calendarDayTimeChooser : function() {
			// Hide calendar when clicking outside
			$(document).click(function(event) {
				var thisdaytimechooser = $(event.target).closest('.calendar-date-time-chooser');
				if(thisdaytimechooser.length) {
					// Don't hide any chooser
				} else {
					// hide all
					$('.calendar-date-time-chooser .small-calendar').slideUp();
				}
			});

			$('.calendar-date-time-chooser input.calendar-date-time-chooser-date')
				.click(function() {
				$('.calendar-date-time-chooser .small-calendar').slideDown();
			});

			$('.calendar-date-time-chooser i').click(function() {
				$('.calendar-date-time-chooser .small-calendar').slideDown();
			});

			$('.calendar-date-time-chooser .small-calendar').hide();


			// on every re-drawing of the calendar select the choosen date
			$('.calendar-date-time-chooser .small-calendar')
				.on("fullCalendarViewRender", function(event, cell) {
					// select choosen day

					var date = $(this)
						.closest('.calendar-date-time-chooser')
						.find('.calendar-date-time-chooser-hiddendate')
						.val();
					// "2014-04-28"
					if (date) $(this)
						.find('td[data-date='+date+']')
						.addClass('selected');
				})
				.trigger('fullCalendarViewRender')

				// when clicked on a day: use this!
				.on("fullCalendarDayClick", function(event, date, jsEvent) {
					var dayElement = jsEvent.currentTarget;
					if ($(dayElement).hasClass('fc-other-month')) return;

					var dateDataAttr = date.getFullYear() + "-"
						+ ((date.getMonth()+1).toString().length === 2
							? (date.getMonth()+1)
							: "0" + (date.getMonth()+1)) + "-"
						+ (date.getDate().toString().length === 2
							? date.getDate()
							: "0" + date.getDate());

					// unselect all and re-select later
					$(dayElement).parent().parent().find('td').removeClass('selected');
					$(dayElement).addClass('selected');


					// When date picked, update date in form
					$(this)
						.closest('.calendar-date-time-chooser')
						.find('.calendar-date-time-chooser-hiddendate')
						.val(dateDataAttr);

					// Update INPUT with human readable date
					moment.lang(moment.lang(),$.cosinnus.momentShort[moment.lang()]);
					var humanDateString = moment(dateDataAttr).calendar();
						$(this)
							.closest('.calendar-date-time-chooser')
							.find('.calendar-date-time-chooser-date')
							.val(humanDateString);
				});

			// Set INPUT with human readable date
			$('.calendar-date-time-chooser').each(function() {
				var dateDataAttr = $(this)
					.find('.calendar-date-time-chooser-hiddendate')
					.val();

				if (dateDataAttr) {
					moment.lang(moment.lang(),$.cosinnus.momentShort[moment.lang()]);
					var humanDateString = moment(dateDataAttr).calendar();
						$(this)
							.find('.calendar-date-time-chooser-date')
							.val(humanDateString);
				}
			});
		}
	};
})( jQuery );


$(document).ready(function() {
	var foobar = function() {
		if( ! $('#myCanvas').tagcanvas({
		     textColour : '#000',
		     outlineColour : '#da6137',
		     outlineMethod : 'colour',
		     outlineThickness : 1,
		     pulsateTime : '1',
		     stretchX : 5,
		     imageScale : 0.6,
		     maxSpeed : 0.03,
		     depth : 0.5,
		     zoom : 0.75,
		     fadeIn: 2000
		   })) {
		     // TagCanvas failed to load
		     $('#myCanvasContainer').hide();
		   }
	};
	window.setTimeout(foobar, 1000);
	$.ecobasa.fullcalendar();
	$.ecobasa.calendarBig();
//	$.ecobasa.calendarDayTimeChooser();

	$('#bus').tooltip(); 
	$('.container.about #progress_bar').tooltip();
	$('.email').tooltip();
});
