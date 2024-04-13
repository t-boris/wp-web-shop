<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="profile" href="http://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<header id="site-header" class="header">
    <script>
        function toggleMenu() {
            let menu = document.getElementById('site-navigation');
            console.log(menu);
            menu.classList.toggle('active');
        }
    </script>
    <div class="logo">
        <?php
        if (function_exists('the_custom_logo')) {
            the_custom_logo();
        }
        ?>
    </div>
    <!-- Hamburger Icon -->
    <div id="hamburger-icon" onclick="toggleMenu()">
        <i class="fas fa-bars"></i>
    </div>
    <nav id="site-navigation" class="main-navigation">
        <?php
        wp_nav_menu(array(
            'theme_location' => 'header-menu',
            'menu_id'        => 'primary-menu',
        ));
        ?>
    </nav>
</header>
