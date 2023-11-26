import React from 'react';
import './App.css';


// config
const cache_url = 'http://localhost:3001/';
const img_prefix = 'https://www.themoviedb.org/t/p/w220_and_h330_face';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            qs: '',
            page: 1,
            results: [],
            total_pages: 0,
            status: ''
        };
    }

    doSearch = (p) => {
        fetch(cache_url + "?qs=" + encodeURIComponent(this.state.qs) + '&p=' + p)
        .then(response => {
            if (response.ok) {
                response.json().then(data => {
                    this.setState({results: data.results, total_pages: data.total_pages});
                });
            } else {
                throw response;
            }
        }).catch(ex => this.setState({status: ex}));
    }

    render = () => {
        let dispResults = [];
        for (let j = 0; j < 4; ++j) {
            dispResults[j] = [];
            for (let i = 0; i < 5; ++i) {
                let n = i + j * 5;
                const imgSrc = this.state.results[n] && this.state.results[n].poster_path ? img_prefix + this.state.results[n].poster_path
                                                                                          : 'http://lorro.hu/tmp/nothing.jpg';
                const info = this.state.results[n] && this.state.results[n].original_title ? this.state.results[n].original_title
                                                                                           : '';
                dispResults[j][i] = {imgSrc, info};
            }
        }

        let pages_in_pagination = [];
        const p0 = Math.max(Math.min(this.state.page - 2, this.state.total_pages - 4), 1);
        for (let i = p0; i <= Math.min(this.state.total_pages, p0 + 4); ++i) {
            pages_in_pagination.push(i);
        }

        return (
            <div className="App">
                <input type="text" className='query' value={this.state.qs} onChange={e => this.setState({qs: e.target.value})}/>&nbsp;
                <button type="button" onClick={e => this.doSearch(this.state.page)}>Search</button><br/>
                {this.status}
                <br/>
                <table border='0'>
                    {dispResults.map((l, j) => <>
                        <tr key={j}>
                            {l.map((elem, i) =>
                                <td key={i} className='dispelem'>
                                    <img src={elem.imgSrc}/><br/>
                                </td>
                            )}
                        </tr>
                        <tr key={j + 20}>
                            {l.map((elem, i) =>
                                <td key={i} className='dispinfo'>
                                    {elem.info}
                                </td>
                            )}
                        </tr>
                    </>)}
                    <tr>
                        <td colSpan={5} className='paginate'>
                            {pages_in_pagination.length > 1 && <a href='javascript:;' onClick={() => this.doSearch(1)}>&lt;&lt;</a>}&nbsp;
                            {this.state.page > 1 && <a href='javascript:;' onClick={() => this.doSearch(this.state.page - 1)}>&lt;</a>}&nbsp;
                            {pages_in_pagination.map(p => p === this.state.page ? <b><a key={p} href='javascript:;' onClick={() => this.doSearch(p)}>{p}&nbsp;</a></b>
                                                                                :    <a key={p} href='javascript:;' onClick={() => this.doSearch(p)}>{p}&nbsp;</a>)}
                            {this.state.page < this.state.total_pages && <a href='javascript:;' onClick={() => this.doSearch(this.state.page + 1)}>&gt;</a>}&nbsp;
                            {pages_in_pagination.length > 1 && <a href='javascript:;' onClick={() => this.doSearch(this.state.total_pages)}>&gt;&gt;</a>}
                        </td>
                    </tr>
                </table>
            </div>
        );
    }
}
