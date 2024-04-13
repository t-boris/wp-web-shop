<?php get_header(); ?>

    <style type="text/css">
        .panel {
            height: 100vh;
            width: 100%;
        }
        .panel.green {
            margin-bottom: 400px;
        }
    </style>

    <div id="content">
        <section class="panel blue">
            <?php get_template_part('panel', 'general_info'); ?>
        </section>
        <section class="panel turquoise">
            <b>TWO</b>
        </section>
        <section class="panel green">
            <b>THREE</b>
        </section>
        <section class="panel bordeaux">
            <b>FOUR</b>
        </section>
    </div>

    <!-- This is a test -->
<?php get_footer(); ?>

    <script>
        jQuery(document).ready(function($) { // wait for document ready
            // init
            const controller = new ScrollMagic.Controller({
                globalSceneOptions: {
                    triggerHook: 'onLeave',
                    duration: "70%"
                }
            });

            // get all slides
            const slides = document.querySelectorAll("section.panel");

            // create scene for every slide
            for (let i=0; i<slides.length; i++) {
                new ScrollMagic.Scene({
                    triggerElement: slides[i]
                })
                    .setPin(slides[i], {pushFollowers: false})
                    .addTo(controller);
            }
        });
    </script>