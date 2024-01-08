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

      // Use SpeechSynthesis to speak out the bot response
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(botSpan.text());
      const volumeControl = document.getElementById("volumeControl");

      // Set initial volume
      utterance.volume = volumeControl.value / 100;
      synth.speak(utterance);

      // Add event listener to adjust utterance volume when volume control changes
      volumeControl.addEventListener("change", function () {
        // Stop the current synthesis
        synth.cancel();

        // Start a new synthesis with the updated volume
        utterance.volume = volumeControl.value / 100;
        synth.speak(utterance);
      });

      // After processing the stream, initiate the second fetch
      await fetch("/save_bot_response", {
        method: "POST",
        body: botSpan.text(),
      });
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
  if (document.getElementById("textInput").value != "") {
    getBotResponse();
  }
});

let isMuted = false;
let previousVolume = 100; // Initial volume

function showVolumeControl() {
  const volumeControl = document.getElementById("volumeControl");
  volumeControl.style.display = "block";
}

function hideVolumeControl() {
  const volumeControl = document.getElementById("volumeControl");
  volumeControl.style.display = "none";
}

function toggleMute() {
  const speakerButton = document.getElementById("speakerButton");
  const volumeControl = document.getElementById("volumeControl");

  if (isMuted) {
    // Unmute - apply the previous volume value
    volumeControl.value = previousVolume;
    speakerButton.src = "static/assets/speaker.png";
  } else {
    // Mute - cache the previous volume value and set volume to 0
    previousVolume = volumeControl.value;
    volumeControl.value = 0;
    speakerButton.src = "static/assets/speaker_muted.png";
  }

  // Update the mute status
  isMuted = !isMuted;

  volumeControl.dispatchEvent(new Event('change'));
}

function changeVolume() {
  const speakerButton = document.getElementById("speakerButton");
  const volumeControl = document.getElementById("volumeControl");
  // Use the volume value as needed, e.g., to set the volume for audio output
  const volume = volumeControl.value;
  // Implement the logic to use the volume value
  if (volume == 0) {
    isMuted = true;
    speakerButton.src = "static/assets/speaker_muted.png";
  } else {
    isMuted = false;
    speakerButton.src = "static/assets/speaker.png";
  }
  // Update the previous volume value if not muted
  if (!isMuted) {
    previousVolume = volume;
  }
}

listening = false;

document.addEventListener("DOMContentLoaded", function () {
  const voiceInputButton = document.getElementById("voiceInputButton");
  const textInput = document.getElementById("textInput");

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceInputButton.addEventListener("click", function () {
    if (!listening) {
      listening = true;
      recognition.start();
      voiceInputButton.classList.add("listening");
      voiceInputButton.src = "static/assets/microphone_green.png";
    } else {
      listening = false;
      recognition.stop();
    }
  });

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    textInput.value = transcript;
  };

  recognition.onend = function () {
    // This event is triggered when recognition stops
    voiceInputButton.classList.remove("listening");
    voiceInputButton.src = "static/assets/microphone_grey.png";
    recognition.stop();
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
  };
});
