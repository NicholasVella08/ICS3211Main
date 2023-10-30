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
