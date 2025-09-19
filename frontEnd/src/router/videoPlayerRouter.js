import VideoPlayer from '../views/video_player.vue'

const videoPlayerRoutes = [
    {
        path: '/video-player/:id',
        name: 'videoPlayer',
        component: VideoPlayer,
    },
]

export default videoPlayerRoutes
