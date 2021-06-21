import { createMuiTheme } from '@material-ui/core/styles'
import { grey } from '@material-ui/core/colors'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#f57e7e",
      dark: "#de7171"
    },
    secondary: {
      main: "#8075ff",
      contrastText: "#f8f0fb",
    },
  },
  typography: {
    fontFamily: 'Open Sans, Arial',
  }
})


theme.props = {
  MuiButton: {
    disableElevation: true,
  },
  MuiInputLabel: {
    shrink: true,
  },
  MuiInput: {
    disableUnderline: true,
  },
  MuiTooltip: {
    arrow: true,
  },
}

theme.overrides = {
  MuiButton: {
    root: {
      borderRadius: 5,
      textTransform: 'none',
    },
    containedPrimary: {
      '&:hover': {
        backgroundColor: `${theme.palette.primary.dark}`,
      },
    },
  },
  MuiInputLabel: {
    root: {
      textTransform: 'none',
      fontSize: '1rem',
    },
  },
  MuiInput: {
    root: {
      border: `1px solid ${grey[500]}`,
      outline: `1px solid transparent`,
      padding: theme.spacing(1),
      '&$focused': {
        border: `1px solid ${theme.palette.primary.main}`,
        outline: `1px solid ${theme.palette.primary.main}`,
      },
    },
  },
  MuiAutocomplete: {
    root: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2)
    }
  },
  MuiTooltip: {
    tooltip: {
      backgroundColor: '#fff',
      border: `2px solid #000`,
      color: '#000',
    }
  },
}

export default theme