$(document).ready(function () {
  const homeSection = $(".home");
  const askSection = $(".Ask");
  const targetScrollPosition = homeSection.height() / 9;
  let scrolledPastQuarter = false;

  $(document).on("scroll", function () {
    if (
      $(document).scrollTop() > targetScrollPosition &&
      !scrolledPastQuarter
    ) {
      scrollToNextSection();
      scrolledPastQuarter = true;
    }
  });

  function scrollToNextSection() {
    $("html, body").animate(
      {
        scrollTop: askSection.offset().top,
      },
      1000
    ); // Adjust the animation duration as needed
  }
});

// chatbot
function getBotResponse() {
  var rawText = $("#textInput").val();
  var userHtml =
    '<p class="userText"><span>' +
    rawText +
    '</span><img src="static/assets/userProfile.png" alt="userProfile" /></p>';

  $("#textInput").val("");
  $("#chatbox").append(userHtml);

  // Create the initial bot HTML elements
  var botParagraph = $(
    '<p class="botText"><img src="static/assets/doctor.png" alt="botProfile" /></p>'
  );
  var botSpan = $("<span></span>");

  // Append the bot span to the bot paragraph
  botParagraph.append(botSpan);

  // Append the bot paragraph to the chatbox
  $("#chatbox").append(botParagraph);

  // Use the Fetch API to handle the streaming content
  fetch("/get?msg=" + rawText)
  .then((response) => response.body.getReader())
  .then(async (reader) => {
    const processStream = async () => {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // If the stream is done, break out of the loop
          break;
        }

        // Decode the value as UTF-8
        const decodedValue = new TextDecoder("utf-8").decode(value);

        // Set the decoded value as text content of the bot span
        botSpan.text(botSpan.text() + decodedValue);
      }
    };

    // Start processing the stream
    await processStream();

    // After processing the stream, initiate the second fetch
    await fetch("/save_bot_response", { method: "POST", body: botSpan.text() });
  })
  .catch((error) => {
    // Handle errors here
    console.error("Error:", error);
  });
}

$("#textInput").keypress(function (e) {
  if (e.which == 13 && document.getElementById("textInput").value != "") {
    getBotResponse();
  }
});

$("#buttonInput").click(function () {
  console.log("button clicked");
  if (document.getElementById("textInput").value != "") {
    getBotResponse();
  }
});
