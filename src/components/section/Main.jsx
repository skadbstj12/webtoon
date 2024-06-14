import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const Main = (props) => {
    return (
        <HelmetProvider>
            <Helmet
                titleTemplate="%s | Webtoon"
                defaultTitle="Webtoon"
                defer={false}
            >
                {props.title && <title>{props.title}</title>}
                <meta name="description" content={props.description} />
            </Helmet>
            {props.children}
        </HelmetProvider>
    );
}

export default Main;
