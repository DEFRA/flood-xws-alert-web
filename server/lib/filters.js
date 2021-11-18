function alertTypeTag (type) {
  switch (type) {
    case 'fa':
      return '<strong class="govuk-tag govuk-tag--blue">alert</strong>'
    case 'fw':
      return '<strong class="govuk-tag govuk-tag--yellow">warning</strong>'
    case 'sfw':
      return '<strong class="govuk-tag govuk-tag--red">severe</strong>'
  }
}

module.exports = {
  alertTypeTag
}
