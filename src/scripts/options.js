import 'jquery/dist/jquery.min'

$(() => {
  const $optionPages = $('.option-page')
  const $optionNavs = $('.option-nav')

  const switchOptionPage = (index) => {
    const $prevPage = $optionPages.not('.hidden')
    const $currentPage = $optionPages.eq(index)

    $optionNavs
      .removeClass('selected')
      .eq(index)
      .addClass('selected')

    $prevPage.addClass('hidden')
    $currentPage
      .removeClass('hidden')
      .addClass('showing')

    setTimeout(() => {
      $currentPage
        .removeClass('showing')
        .trigger('show')
    }, 100)
  }

  $(window)
    .on('hashchange', () => {
      const $targetNav = $(location.hash.replace(/#/, '.option-'))
      let index = $targetNav.index()
      console.log($targetNav, index)
      index = index !== -1 ? index : 0
      switchOptionPage(index)
    })
    .trigger('hashchange')

  $('.option-docs')
    .on('show', (() => {
      const $iframe = $('.option-docs iframe')
      return () => {
        if (!$iframe.attr('src')) {
          $iframe.attr('src', 'http://devdocs.io')
            .load(() => {
              const $arrow = $('.arrow')
              $arrow
                .click(() => {
                  $(this).remove()
                })
              setTimeout(() => {
                $arrow.addClass('showing')
              }, 500)

              setTimeout(() => {
                $arrow
                  .removeClass('showing')
                  .addClass('transparent')
              }, 1500)

              setTimeout(() => {
                $arrow.remove()
              }, 1800)
            })
        }
      }
    })())

  $('.theme')
    .on('change', 'input', () => {
      const $themeInput = $(this)
      localStorage.setItem('theme', $themeInput.val())
    })
    .find('.' + localStorage.getItem('theme'))
    .prop('checked', true)

  $('.size')
    .on('input', '.width', () => {
      const $width = $(this)
      const width = $width.val()
      $width.next().html(width)
      localStorage.setItem('width', width)
    })
    .on('input', '.height', () => {
      const $height = $(this)
      const height = $height.val()
      $height.next().html(height)
      localStorage.setItem('height', height)
    })
    .find('input')
    .val(() => {
      const $size = $(this)
      const key = $size.attr('name')
      return localStorage.getItem(key)
    })
    .trigger('input')
})
