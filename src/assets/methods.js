export default {
  mapStatus(string) {
    const roomList = [
      "Seminar 1",
      "Seminar 2",
      "Seminar 3",
      "Seminar 4",
      "Seminar Area",
      "Foyer",
      "Crane Hall",
    ];
    for (let i = 0; i < roomList.length; i++) {
      let roomRegex = new RegExp(".*" + roomList[i] + ".*", "i");
      if (roomRegex.test(string)) {
        return roomList[i];
      }
    }
    return "NO MATCH";
  },  
  getDateFormatted(dateString) {
    const date = new Date(dateString);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },
  async getData(startDate, endDate) {
    const baseUrl = "https://tourism.api.opendatahub.com/v1/EventShort";

    const params = new URLSearchParams({
      pagenumber: "1",
      startdate: this.getDateFormatted(startDate),
      enddate: this.getDateFormatted(endDate),
      eventlocation: "NOI",
      active: "true",
      sortorder: "ASC",
      optimizedates: "true",
      removenullvalues: "true",
    });

    const url = `${baseUrl}?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      return json; // Return the data
    } catch (error) {
      console.error(error.message);
    }
  },
  async getSensorData(dataType, roomSensor) {
    const baseUrl = `https://mobility.api.opendatahub.com/v2/flat/IndoorStation/${dataType}/latest`;

    const params = new URLSearchParams({
      limit: "1",
      offset: "0",
      where: "sname.eq.", roomSensor,
      shownull: "false",
      distinct: "true",
      timezone: "+1",
    });

    const url = `${baseUrl}?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      return json; // Return the data
    } catch (error) {
      console.error(error.message);
    }
  },
  createEvent(start, end, event, roomName) {
    console.log("creating event")
    //create the main event
    const mainEvent = {
      start: this.getDateFormatted(start),
      end: this.getDateFormatted(end),
      title: event.EventTitle.it,
      content: "",
      class: "event",
      split: roomName,
      company: event.CompanyName,
      contactFirstName: event.ContactFirstName,
      contactLastName: event.ContactLastName,
      contactPhone: event.ContactPhone,
      contactCell: event.ContactCell,
      contactEmail: event.ContactEmail
    };

    const heatingEventStart = new Date(start);
    heatingEventStart.setMinutes(heatingEventStart.getMinutes() - 60);

    // create the corresponding heating event
    const heatingEvent = {
      start: this.getDateFormatted(heatingEventStart),
      end: this.getDateFormatted(end),
      title:"",
      content: "",
      class: "heating",
      split: roomName,
    };
    return [mainEvent, heatingEvent];
  },
  scrollToCurrentTime() {
    const now = document.getElementsByClassName("vuecal__now-line")[0]
    now.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  },
  getReadableDate(dateString) {
    const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
    ];

    const date = new Date(dateString);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day} ${months[month-1]} ${year} at ${hours}:${minutes}`;
  },
  formatRoomName(roomName) {
    // check if the last character is a number (Seminar1 should become Seminar 1)
    if(!isNaN(roomName[roomName.length-1])) {
      roomName = roomName.slice(0, roomName.length - 1) + " " + roomName[roomName.length - 1];
    }
    return roomName
  }
};
   