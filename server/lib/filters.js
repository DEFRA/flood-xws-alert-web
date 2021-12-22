const dayjs = require('common/date')
const { DATE_FORMAT } = require('common/constants')

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

function areaCategoryTag (type) {
  if (type === 't') {
    return '<strong class="govuk-tag govuk-tag--purple">tidal</strong>'
  } else if (type === 'c') {
    return '<strong class="govuk-tag govuk-tag--pink">coastal</strong>'
  } else if (type === 'f') {
    return '<strong class="govuk-tag govuk-tag--turquoise">fluvial</strong>'
  } else if (type === 'g') {
    return '<strong class="govuk-tag govuk-tag--grey">groundwater</strong>'
  } else if (type === 'b') {
    return `<strong class="govuk-tag govuk-tag--turquoise">fluvial</strong>
      <strong class="govuk-tag govuk-tag--purple">tidal</strong>`
  }
}

function targetAreaTypeTag (type) {
  if (type === 'faa') {
    return '<strong class="govuk-tag govuk-tag--blue">alert</strong>'
  } else if (type === 'fwa') {
    return '<strong class="govuk-tag govuk-tag--yellow">warning</strong>'
  }
}

function date (date, format = DATE_FORMAT) {
  return dayjs(date).format(format)
}

module.exports = {
  date,
  alertTypeTag,
  areaCategoryTag,
  targetAreaTypeTag
}
