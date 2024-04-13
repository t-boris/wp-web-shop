<script>
    var themeDir = '<?php echo get_template_directory_uri(); ?>';
    var phrases = ['Looking for a perfect sound?', 'Handmade', 'Custom design', 'Clear Sound', 'Guitar sound sensors', 'Most powerful sensor', 'Indulge your senses'];
</script>
<div id="wave-container" data-audio-url="<?php echo get_template_directory_uri(); ?>/assets/sounds/intro-solo.mp3">
    <div id="canvas-container">
        <canvas id="wave-canvas"></canvas>
        <canvas id="star-canvas"></canvas>
    </div>
    <button id="toggle-sound">
        <i class="fas fa-volume-mute"></i>
    </button>
    <div id="scroll-indicator">
        <i class="fas fa-chevron-down"></i>
    </div>
</div>