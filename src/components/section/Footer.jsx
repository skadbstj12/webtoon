import { snsLink } from "../../data/footer"

const Footer = () => {
    return (
        <footer id='footer' role='contentinfo'>
            <a href="mailto:nys060121@naver.com" rel="noopener noreferrer">
                nys060121@naver.com
            </a>
            <div className='footer__sns'>
                <ul>
                    {snsLink.map((sns, key) => (
                        <li key={key}>
                            <a href={sns.url} target="_blank" rel="noopener noreferrer" aria-label={sns.title}>
                                <span>{sns.icon}</span>
                            </a>
                        </li>
                    ))}

                </ul>
            </div>
        </footer>
    )
}

export default Footer
