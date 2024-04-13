<?php
function mytheme_enqueue_styles() {
    // Enqueue the main stylesheet with theme metadata
    wp_enqueue_style('mytheme-style', get_stylesheet_uri());

    // Enqueue the compiled CSS from SCSS
    wp_enqueue_style('mytheme-main-css', get_template_directory_uri() . '/assets/css/main.css', array(), '1.0.0', 'all');
}
add_action('wp_enqueue_scripts', 'mytheme_enqueue_styles');


function my_theme_scripts()
{
    wp_enqueue_script('jquery');
    wp_enqueue_script('scrollmagic', get_template_directory_uri() . '/js/scrollmagic/ScrollMagic.min.js', array('jquery'), '2.0.8', true);
    wp_enqueue_script('wave-element-script', get_template_directory_uri() . '/js/wave-element.js', array('jquery'), '1.0', true);
    wp_enqueue_script('scrollmagic-indicators', get_template_directory_uri() . '/js/scrollmagic/plugins/debug.addIndicators.min.js', array('scrollmagic'), '2.0.8', true);
    wp_enqueue_script('three-js', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', array(), 'r128', true);
    wp_enqueue_script('gsap', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js', array(), '3.9.1', true);
    wp_enqueue_script('objloader', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js', array('three-js'), '128', true);
    wp_enqueue_script('rgbeloader', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/RGBELoader.js', array('three-js'), '128', true);
}

add_action('wp_enqueue_scripts', 'my_theme_scripts');

function mytheme_setup() {
    add_theme_support('custom-logo', array(
        'height'      => 100,
        'width'       => 400,
        'flex-height' => true,
        'flex-width'  => true,
    ));
}
add_action('after_setup_theme', 'mytheme_setup');

function mytheme_register_menus() {
    register_nav_menus(array(
        'header-menu' => __('Header Menu', 'mytheme'),
    ));
}
add_action('init', 'mytheme_register_menus');

