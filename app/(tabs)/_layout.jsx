import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY = '#4f46e5'

// Pestañas principales de la app. Cada módulo agrega aquí su pestaña.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: PRIMARY, headerTitleAlign: 'center' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Proyectos',
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
