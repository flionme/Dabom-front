import community from "@/views/channel/subview/Community.vue"
import playlist from "@/views/channel/subview/playlist/Playlist.vue"
import channel from "@/views/channel/ChannelMainView.vue"
import about from "@/views/channel/subview/About.vue"
import videos from "@/views/channel/subview/video/Video_Fix.vue"
import ChannelPost from "@/components/channel/community/ChannelPost.vue"

const channelRoutes = [
    {
        path: '/channel/:channelIdx',
        name: 'channel',
        component: channel,
        redirect: to => ({ name: 'videos', params: to.params }),
        children: [
            {
                path: '',
                name: 'channelDefault',
                redirect: to => ({ name: 'videos', params: to.params })
            },
            {
                path: 'videos',
                name: 'videos',
                component: videos,
            },
            {
                path: 'playlists',
                name: 'playlists',
                component: playlist
            },
            // {
            //     path: 'playlists',
            //     name: 'channelPlaylists',
            //     component: () => import('@/views/channel/subview/playlist/Playlist.vue'),
            // },
            {
                path: 'community',
                name: 'community',
                component: community
            },
            {
                path: 'about',
                name: 'about',
                component: about
            },

        ],
    },
    {
        path: '/post/:id',
        name: 'post',
        component: ChannelPost
    },

    // 내 채널 (별도 경로)
    {
        path: '/mychannel',
        name: 'mychannel',
        component: mychannel,
    }
]

export default channelRoutes