function onFormSubmit(e) {
    // Here add any properties as you want.
    const emailData = {
        email: 'YOUR-EMAIL-HERE',
        subject: 'ALERT: Event Collision on the Calendar',
        body: ''
    }

    // Default declarations.
    const defaultDuration = 15;
    const calendarID = 'CALENDAR-ID-HERE';

    // Getting the form Data.
    const formResponses = e.response.getItemResponses();

    // Extract information from form responses.
    const formData = {
        eventTitle:   formResponses[0].getResponse(),
        startTime:    convertToDateTime(formResponses[1].getResponse()),
        endTime:      "",
        duration:     parseInt(formResponses[2].getResponse()) || defaultDuration,
        description:  formResponses[3].getResponse(),
        forceSubmission: formResponses.length > 4
    }

    const formattedDate = formData.startTime.toLocaleDateString();

    // Adding the extra minutes to the corresponding time to finish.
    formData.endTime = new Date(formData.startTime.getTime() + formData.duration * 60000);

    const valid = validateEventSubmission(calendarID, formData);

    if (valid || formData.forceSubmission) {
        let event = createCalendarEvent(calendarID, formData);

        emailData.subject = 'Evento: ' + formData.eventTitle + ' - Creado con Exito';
        emailData.body = '<div style="padding: 5% 10%; font-size:1.5rem"><p>Su evento <b style="color: green";>"' + formData.eventTitle + '"</b> de fecha <b style="color: green";>"' + formattedDate + '"</b> se ha creado con éxito!!!.</p><ul><li>ID: ' + event.getId() + '</li><li>Título: '+ event.getTitle() + '</li><li>Descripción: ' + event.getDescription() + '</li><li>Color: ' + event.getColor() + '</li></ul></div>';

        sendEmail(emailData);

    } else {
        // Preparing the email data and sending.
        emailData.body = '<div style="padding: 5% 10%;"><p style="font-size: 1.5rem">Su evento <b style="color: red";>"' + formData.eventTitle + '"</b> de fecha <b style="color: red";>"' + formattedDate + '"</b> colisiona con otros eventos en el calendario. Favor verifique o marque el cotejo de "Forzar Agregado" para que se inserte satisfactoriamente.</p></div>';

        sendEmail(emailData);

        throw new Error('¡El evento colisiona con otros eventos en el calendario!');
    }
}

function convertToDateTime(myDate) {
    // Since in JS the months are an array from 0 to 11, we reduce 1 to the month after the split.
    const [date, time] = myDate.split(" ");
    const [year, month, day] = date.split("-");
    const [hours, minutes] = time.split(":");

    return new Date(year, month - 1, day, hours, minutes);
}

function getCalendar(calendarID) {
    return CalendarApp.getCalendarById(calendarID);
}

function createCalendarEvent(calendarID, formData) {
    // Create a new calendar event.
    let calendar = getCalendar(calendarID);
    let event = calendar.createEvent(
        formData.eventTitle,
        formData.startTime,
        formData.endTime,
        {
            description: formData.description
        }
    );
    Logger.log('Event ID: ' + event.getId());
    return event;
}

function validateEventSubmission(calendarID, formData) {
    let calendar = getCalendar(calendarID);
    let events = calendar.getEvents(formData.startTime, formData.endTime);

    return events.length === 0;
}

function sendEmail(data) {
    GmailApp.sendEmail(
        data.email,
        data.subject,
        '',
        {htmlBody: data.body}
    );
}

