import PropTypes from 'prop-types'

// Formas de los datos que reciben varios componentes como props.
// Sirven para PropTypes: describen qué espera cada componente. Solo se listan los campos que se usan;
// el backend puede mandar más.

export const idType = PropTypes.oneOfType([PropTypes.number, PropTypes.string])

// Un estilo de React Native: objeto, lista de estilos, número (StyleSheet) o false/null
export const styleType = PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number, PropTypes.bool])

export const skillShape = PropTypes.shape({
  id: idType.isRequired,
  name: PropTypes.string.isRequired,
})

export const projectShape = PropTypes.shape({
  id: idType.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  status: PropTypes.string,
  budget: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  deadline: PropTypes.string,
  location: PropTypes.string,
  skills: PropTypes.arrayOf(skillShape),
})

export const freelancerProfileShape = PropTypes.shape({
  userId: idType,
  nombre: PropTypes.string,
  avatarUrl: PropTypes.string,
  universidad: PropTypes.string,
  ciclo: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  egresado: PropTypes.bool,
  tarifaHora: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  calificacionPromedio: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
})

// Estado ya traducido de src/utils/status.js: { label, tone }
export const statusShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  tone: PropTypes.string,
})

// Un contrato con los campos que usan las tarjetas del detalle. Los celulares solo llegan
// a las personas del contrato y no en contratos cancelados.
export const contractShape = PropTypes.shape({
  id: idType.isRequired,
  projectTitle: PropTypes.string,
  status: PropTypes.string,
  clientName: PropTypes.string,
  freelancerName: PropTypes.string,
  clientPhone: PropTypes.string,
  freelancerPhone: PropTypes.string,
})
